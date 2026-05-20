import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";
import { TOPICS, type TopicId } from "@/lib/topics";

/** Speaking difficulty / course level (refined in lib/scenarioLevels.ts in step 3.2). */
export type ScenarioLevel = "1" | "2" | "3";

const TOPIC_IDS = TOPICS.map((t) => t.id);

export interface ScenarioDoc extends Document {
  classId: Types.ObjectId;
  topicId: TopicId;
  level: ScenarioLevel;
  promptEnglish: string;
  createdBy?: Types.ObjectId;
}

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
      enum: ["1", "2", "3"],
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
