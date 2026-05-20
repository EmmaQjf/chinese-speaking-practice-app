import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";
import { SCENARIO_LEVEL_IDS, type ScenarioLevel } from "@/lib/scenarioLevels";
import { TOPICS, type TopicId } from "@/lib/topics";

export type { ScenarioLevel } from "@/lib/scenarioLevels";

const TOPIC_IDS = TOPICS.map((t) => t.id);
//“ScenarioDoc describes the shape of data (TypeScript only).A Scenario document should look like this.”
export interface ScenarioDoc extends Document {
  classId: Types.ObjectId;
  topicId: TopicId;
  level: ScenarioLevel;
  promptEnglish: string;
  createdBy?: Types.ObjectId;
}
//“Only save documents that match these rules.”
const scenarioSchema = new Schema<ScenarioDoc>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    topicId: {
      type: String,
      required: true,
      enum: TOPIC_IDS,
    },
    level: {
      type: String,
      required: true,
      enum: SCENARIO_LEVEL_IDS,
    },
    promptEnglish: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

scenarioSchema.index({ classId: 1, topicId: 1 });

const Scenario: Model<ScenarioDoc> =
  models.Scenario ?? model<ScenarioDoc>("Scenario", scenarioSchema);

export default Scenario;
