import * as http from "http";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const systemPrompt = `You are the AI Voice Dispatcher for the Kolkata Omni-Shield Dashboard.
You control a sophisticated city disaster management dashboard.

Provide professional, clear, and concise voice feedback. Ensure your explanations are easy to understand and well-spoken.
Do NOT use any markdown formatting, bullet points, or special characters like asterisks (*). Use plain conversational text only.

If the user wants to execute an action (e.g., dispatch a drone, open a page, view a map layer, route to a location), YOU MUST call the appropriate function tool.
Do NOT just say you will do it, you must actually call the tool.

CRITICAL TOOL RULES:
- If the user asks to route, navigate, or find a path to a location (e.g., "routing to Howrah", "navigate to Eden Gardens"), you MUST use the 'route_to_location' tool.
- If the user asks to stop, cancel, or end navigation, use the 'stop_navigation' tool.
- Do NOT use 'toggle_cyclone_simulation' unless the user explicitly mentions "cyclone", "storm", or "weather simulation".
- If the user asks to open the 'live dashboard', use navigate_page with page="dashboard".
- If the user asks for the 'overview' or 'landing' page, use navigate_page with page="home".
- If the user asks for the 'leaderboard' or 'resilience' page, use navigate_page with page="resilience".

Features you know about:
- Dengue/Vector Risk & AQI Washout Timer
- Road Degradation & Multi-modal Safe Transit
- Drone Dispatch (for hazards)
- Storm/Cyclone Simulation
- Map Layers (Flood, Heat, Crime, AQI)
- Energy Page: Calculators (Solar, Wind, AC, Purifier, Rainwater)
- Emergency Page: Tabs, Ambulance dispatch, Hospital filtering, Volunteer SOS Ping
- Resilience Page (Leaderboard): Toggling Top 10 vs All, toggling calculation info
- Settings: High contrast, Language, Large text
- Dashboard: Pinning/hiding specific widgets

If you change parameters on the UI using tools, wait for the tool to return the computed result (like yield, savings, hospital availability, UI status) and then tell the user what happened!
`;

const tools = [
  {
    type: "function",
    function: {
      name: "route_to_location",
      description: "Calculates the safest transit route between an origin and destination in Kolkata.",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string", description: "The destination location (e.g. 'Eden Gardens', 'Howrah Station')" },
          origin: { type: "string", description: "The starting location. Optional. Defaults to 'Safe House' if not mentioned." }
        },
        required: ["destination"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "stop_navigation",
      description: "Stops any active routing or navigation process.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "dispatch_drone",
      description: "Dispatches an emergency drone to a location or for a specific hazard.",
      parameters: {
        type: "object",
        properties: {
          lat: { type: "number", description: "Target latitude" },
          lng: { type: "number", description: "Target longitude" }
        },
        required: ["lat", "lng"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "fast_forward_simulation",
      description: "Fast forwards the environmental forecasts by a certain number of hours.",
      parameters: {
        type: "object",
        properties: {
          hours: { type: "number", description: "Number of hours to fast forward (1-24)" }
        },
        required: ["hours"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_cyclone_simulation",
      description: "Starts or stops the severe cyclone weather simulation on the map.",
      parameters: {
        type: "object",
        properties: {
          active: { type: "boolean", description: "True to start, false to stop" }
        },
        required: ["active"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "activate_map_layer",
      description: "Turns on a specific risk map layer.",
      parameters: {
        type: "object",
        properties: {
          layer: { type: "string", description: "The layer to activate: flood, heat, crime, or aqi" }
        },
        required: ["layer"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_page",
      description: "Navigates the user's dashboard to a different section/page.",
      parameters: {
        type: "object",
        properties: {
          page: { type: "string", description: "The page to navigate to: emergency, energy, resilience, dashboard, or home" }
        },
        required: ["page"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_solar_parameters",
      description: "Updates the solar calculator parameters on the energy page.",
      parameters: {
        type: "object",
        properties: {
          roofM2: { type: "number", description: "Roof area in square meters" },
          tariff: { type: "number", description: "Electricity tariff in ₹/kWh" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_wind_parameters",
      description: "Updates the wind turbine calculator parameters on the energy page.",
      parameters: {
        type: "object",
        properties: {
          turbineRadius: { type: "number", description: "Turbine rotor radius in meters" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_ac_parameters",
      description: "Updates the AC load and cool roof calculator parameters on the energy page.",
      parameters: {
        type: "object",
        properties: {
          acHomeSize: { type: "number", description: "Home size being cooled in square meters" },
          roofType: { type: "string", description: "Roof type: dark, standard, or white" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_purifier_parameters",
      description: "Updates the air purifier calculator parameters on the energy page.",
      parameters: {
        type: "object",
        properties: {
          purifierWatts: { type: "number", description: "Purifier max wattage" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_rainwater_parameters",
      description: "Updates the rainwater catchment and sump pump calculator parameters on the energy page.",
      parameters: {
        type: "object",
        properties: {
          catchmentArea: { type: "number", description: "Catchment or basement area in square meters" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_emergency_tab",
      description: "Changes the active tab on the emergency page.",
      parameters: {
        type: "object",
        properties: {
          tab: { type: "string", description: "The tab to switch to: Medical, Transport, or Guides" }
        },
        required: ["tab"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "dispatch_ambulance",
      description: "Dispatches an ambulance of a specific type. Used on the emergency page.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", description: "ALS or BLS" }
        },
        required: ["type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "ping_volunteers",
      description: "Triggers the SOS ping to volunteers. Used on the emergency page.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "filter_hospitals",
      description: "Filters the hospital list on the emergency page.",
      parameters: {
        type: "object",
        properties: {
          needBed: { type: "boolean" },
          needOxygen: { type: "boolean" },
          bloodFilter: { type: "string", description: "A+, B-, etc., or 'any'" },
          search: { type: "string", description: "Search term" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_leaderboard_view",
      description: "Toggles the leaderboard view between Top 10 and All Wards on the resilience page.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_calculation_info",
      description: "Toggles the mathematical breakdown/calculation info on the resilience page.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_app_settings",
      description: "Changes global application settings like language, high contrast, or large text.",
      parameters: {
        type: "object",
        properties: {
          language: { type: "string", description: "Language code: en, bn, or hi" },
          toggleHighContrast: { type: "boolean", description: "If true, toggles the high contrast mode" },
          toggleLargeText: { type: "boolean", description: "If true, toggles the large text mode" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_dashboard_card",
      description: "Pins or hides a specific widget card on the dashboard.",
      parameters: {
        type: "object",
        properties: {
          cardId: { type: "string", description: "The ID of the card (e.g. aqi, heat, crime, flood, energy, health, routes, report)" },
          action: { type: "string", description: "pin or hide" }
        },
        required: ["cardId", "action"]
      }
    }
  }
];

export async function handleChatRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const { messages } = JSON.parse(body);

      // Construct OpenAI compatible messages
      const openaiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : (m.role === "tool" ? "tool" : "user"),
          content: m.content || "",
          ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
          ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {})
        }))
      ];

      const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: openaiMessages as any,
        tools: tools as any,
      });

      const choice = response.choices[0].message;

      res.writeHead(200, { ...CORS_HEADERS, "Content-Type": "application/json" });
      res.end(JSON.stringify({
        role: "assistant",
        content: choice.content || "",
        tool_calls: choice.tool_calls && choice.tool_calls.length > 0 ? choice.tool_calls : undefined
      }));
    } catch (err: any) {
      console.error("Groq API Error:", err);
      res.writeHead(500, { ...CORS_HEADERS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}
