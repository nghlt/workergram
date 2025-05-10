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