import mongoose, { Document, Model } from 'mongoose';

export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  body_html: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body_html: { type: String, required: true },
  variables: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const EmailTemplate: Model<IEmailTemplate> = mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;
