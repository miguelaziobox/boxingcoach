const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema, CallToolRequestSchema, ErrorCode, McpError } = require("@modelcontextprotocol/sdk/types.js");
const puppeteer = require("puppeteer-core");

const PORT = 9222; // Port where user's Chrome is running with --remote-debugging-port

const server = new Server(
  {
    name: "notebooklm-local",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// We define our available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ask_notebook_lm",
        description: "Ask a question to NotebookLM and get the answer back. Requires Chrome to be open with --remote-debugging-port=9222 and a NotebookLM tab active.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The question to ask notebooklm",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "read_notebook_lm",
        description: "Read the visible content from the active NotebookLM tab.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      }
    ],
  };
});

async function getNotebookLMPage() {
  try {
    const browserURL = `http://127.0.0.1:${PORT}`;
    const browser = await puppeteer.connect({ browserURL });
    const pages = await browser.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('notebooklm.google.com')) {
        return { browser, page };
      }
    }
    await browser.disconnect();
    throw new Error("NotebookLM tab not found in browser");
  } catch (error) {
    throw new Error(`Failed to connect to browser on port ${PORT}. Ensure Chrome is running with --remote-debugging-port=${PORT}. Details: ${error.message}`);
  }
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "ask_notebook_lm") {
    const query = request.params.arguments.query;
    try {
      const { browser, page } = await getNotebookLMPage();
      
      // Look for the chat input box (using generic selectors that might work, or a simpler approach)
      // Note: NotebookLM's structure might change. A general approach to focus and type.
      // This is a proof-of-concept best-effort extraction.
      await page.waitForSelector('textarea, input[type="text"]', { timeout: 5000 }).catch(() => {});
      const inputs = await page.$$('textarea, input[type="text"]');
      if (inputs.length > 0) {
        // Try typing in the last input (often the chat box)
        const chatBox = inputs[inputs.length - 1];
        await chatBox.focus();
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await page.keyboard.type(query);
        await page.keyboard.press('Enter');
        
        // Wait for response to generate - a basic timer for demo
        await new Promise(r => setTimeout(r, 10000));
        
        // Read text back
        const content = await page.evaluate(() => document.body.innerText);
        await browser.disconnect();
        
        // Just return the last part of the page content for context
        return {
          content: [
            {
              type: "text",
              text: "Question submitted. Since NotebookLM UI differs, here is the text currently visible on page, which should include your answer:\n\n" + content.substring(content.length - 2000),
            },
          ],
        };
      } else {
        await browser.disconnect();
        return {
          content: [{ type: "text", text: "Could not find chat input box on the page." }],
          isError: true,
        };
      }
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error interacting with notebook: ${e.message}` }],
        isError: true,
      };
    }
  } else if (request.params.name === "read_notebook_lm") {
    try {
      const { browser, page } = await getNotebookLMPage();
      const content = await page.evaluate(() => document.body.innerText);
      await browser.disconnect();
      return {
        content: [
          {
            type: "text",
            text: content.substring(0, 5000) + (content.length > 5000 ? "..." : ""),
          },
        ],
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("NotebookLM MCP server running on stdio");
}

run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
