/**
 * src/types/workergram.ts
 * Defines Workergram-specific types that are separate from Grammy types
 */

import { MessageEntities } from "./entitites";

export interface WorkergramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface WorkergramCaption {
  text: string;
  entities?: MessageEntities;
}

export interface WorkergramVideo {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail?: WorkergramPhotoSize;
  caption?: WorkergramCaption;
}

export interface WorkergramAudio {
  file_id: string;
  file_unique_id: string;
  duration: number;
  performer?: string;
  title?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail?: WorkergramPhotoSize;
  caption?: WorkergramCaption;
}

export interface WorkergramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail?: WorkergramPhotoSize;
  caption?: WorkergramCaption;
}

export interface WorkergramSticker {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  is_animated: boolean;
  is_video: boolean;
  emoji?: string;
  set_name?: string;
  file_size?: number;
  thumbnail?: WorkergramPhotoSize;
}

export interface WorkergramVoice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface WorkergramVideoNote {
  file_id: string;
  file_unique_id: string;
  length: number;
  duration: number;
  file_size?: number;
  thumbnail?: WorkergramPhotoSize;
}

export interface WorkergramAnimation {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail?: WorkergramPhotoSize;
  caption?: WorkergramCaption;
} 
export type MimeType = "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "video/mp4" | "audio/mpeg" | "application/pdf" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.ms-excel" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/zip" | "application/json" | "text/plain" | "text/html" | "text/css" | "text/javascript" | "application/octet-stream";

export type MimeTypeKey = "jpg" | "jpeg" | "png" | "gif" | "webp" | "mp4" | "mp3" | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "zip" | "json" | "txt" | "html" | "css" | "js" | "other";

export const MimeTypes: Record<MimeTypeKey, MimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
  json: "application/json",
  txt: "text/plain",
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  other: "application/octet-stream",
}