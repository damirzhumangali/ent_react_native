import { Subject } from "./subject";

export interface FigureParams {
  // Triangle / right_triangle
  sideA?: number;
  sideB?: number;
  sideC?: number;
  angleA?: number;
  angleB?: number;
  angleC?: number;
  labelA?: string;
  labelB?: string;
  labelC?: string;

  // Circle
  radius?: number;
  labelR?: string;

  // Pyramid
  baseA?: number;
  baseB?: number;
  height?: number;
  labelH?: string;

  // Coordinate figure
  centerX?: number;
  centerY?: number;
  slope?: number; // for line y=kx+b
  intercept?: number;
  labelLine?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  subject: Subject;
  topic?: string;
  figureType?: string; // "triangle", "right_triangle", "pyramid", "circle", "coordinate_line", "coordinate_circle"
  figureParams?: FigureParams;
  explanation?: string;
  questionType?: string; // "single", "text", "multiselect"
  correctAnswers?: string[];
}
