import { z } from "zod";

// Update these to match your actual EnergyCategory union
const EnergyCategorySchema = z.enum([
  "solar",
  "wind",
  "battery_storage",
  "natural_gas",
  "nuclear",
  "hydro",
]).describe("The primary energy category or sector this project belongs to.");

// Update these to match your actual Momentum union
const MomentumSchema = z.enum([
  "accelerating",
  "steady",
  "slowing",
  "stalled",
]).describe("The direction of recent activity/interest on this project — whether it's heating up or cooling off.");

export const ProjectSchema = z.object({
  id: z.string().describe("Unique identifier for the project."),
  name: z.string().describe("The official or commonly used name of the project."),
  city: z.string().describe("The city where the project is located."),
  state: z.string().describe("The U.S. state (or region) where the project is located, typically as a two-letter code."),
  lat: z.number().describe("Latitude coordinate of the project site."),
  lng: z.number().describe("Longitude coordinate of the project site."),
  category: EnergyCategorySchema,
  technology: z.string().describe("The specific technology used, e.g. 'crystalline silicon PV', 'lithium-ion', 'onshore turbine'."),
  capacityMw: z.number().describe("Nameplate generation or storage capacity of the project, measured in megawatts (MW)."),
  stage: z.string().describe("The current development stage of the project, e.g. 'permitting', 'construction', 'operational'."),
  score: z.number().describe("A computed relevance or opportunity score for the project, used to rank or prioritize it."),
  momentum: MomentumSchema,
  confidence: z.number().describe("A confidence level (typically 0-1 or 0-100) indicating how reliable the underlying data for this project is."),
  signals: z.number().describe("Count of distinct signals or data points detected that relate to this project."),
  updatedMinutesAgo: z.number().describe("How many minutes ago this project's data was last updated."),
  whyNow: z.string().describe("A short, human-readable explanation of why this project is currently notable or worth attention."),
}).describe("Represents an energy infrastructure project being tracked, including its location, technology, development status, and computed relevance signals.");

const ImportanceSchema = z.enum([
  "Low",
  "Medium",
  "High",
]).describe("The urgency or significance of this signal — how much attention it warrants right now.");

export const SignalSchema = z.object({
  id: z.string().describe("Unique identifier for the signal."),
  project: z.string().describe("The name of the project this signal relates to."),
  category: z.string().describe("The type of activity or event this signal represents, e.g. 'Interconnection', 'Large Load', 'Permit', 'Construction'."),
  source: z.string().describe("The organization or origin that produced this signal, e.g. a grid operator, regulatory agency, or public filing."),
  time: z.string().describe("Human-readable relative timestamp indicating how long ago the signal was detected, e.g. '4 min ago'."),
  importance: ImportanceSchema,
}).describe("Represents a discrete, time-stamped event or update detected for a tracked project, used to surface recent activity that may affect its status or relevance.");


