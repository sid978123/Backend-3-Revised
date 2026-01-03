import mongoose from "mongoose";
import { Schema } from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },



  //Optional , If you want to add then add them.....

    watchedAt: {
      type: Date,
      default: Date.now,
    },

    watchTime: {
      type: Number, // seconds watched
      default: 0,
    },
  },
  { timestamps: true }
);

watchHistorySchema.index({ user: 1, video: 1 });

export const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);
