import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string;
  summary?: string;
  fileType: string;
  originalFileName: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  fileType: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate word count before saving
DocumentSchema.pre<IDocument>('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).length;
  }
  next();
});

export default mongoose.model<IDocument>('Document', DocumentSchema);