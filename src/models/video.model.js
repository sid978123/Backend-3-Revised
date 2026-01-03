import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      requird: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    view: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    videoFile : {
      type : String,
      required : true
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video" , videoSchema)