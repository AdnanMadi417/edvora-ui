import { Code2, Smartphone, Rocket, PenTool, Sparkles, Plug, type LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiVuedotjs, SiNodedotjs, SiLaravel, SiDjango, SiGo,
  SiPostgresql, SiRedis, SiGraphql, SiFlutter, SiSwift, SiKotlin, SiExpo, SiAmazonaws, SiGooglecloud,
  SiMicrosoftazure, SiDocker, SiKubernetes, SiVercel, SiOpenai, SiPython, SiPytorch, SiMongodb,
  SiLinkedin, SiX, SiGithub, SiDribbble, SiInstagram,
} from "react-icons/si";
import type { IconKey, TechKey } from "lib/content";

// Content refers to icons by key so content.ts stays plain data.
// The brief (§4.8, §11.6) wraps icons so the set can be swapped later.
export const serviceIcons: Partial<Record<IconKey, LucideIcon>> = {
  web: Code2,
  mobile: Smartphone,
  rocket: Rocket,
  design: PenTool,
  ai: Sparkles,
  api: Plug,
};

export const techIcons: Record<TechKey, IconType> = {
  react: SiReact, next: SiNextdotjs, typescript: SiTypescript, tailwind: SiTailwindcss, vue: SiVuedotjs,
  node: SiNodedotjs, laravel: SiLaravel, django: SiDjango, go: SiGo, postgres: SiPostgresql, redis: SiRedis, graphql: SiGraphql,
  flutter: SiFlutter, reactnative: SiReact, swift: SiSwift, kotlin: SiKotlin, expo: SiExpo,
  aws: SiAmazonaws, gcp: SiGooglecloud, azure: SiMicrosoftazure, docker: SiDocker, kubernetes: SiKubernetes, vercel: SiVercel,
  openai: SiOpenai, python: SiPython, pytorch: SiPytorch, mongodb: SiMongodb,
};

export const socialIcons: Record<"linkedin" | "x" | "github" | "dribbble" | "instagram", IconType> = {
  linkedin: SiLinkedin,
  x: SiX,
  github: SiGithub,
  dribbble: SiDribbble,
  instagram: SiInstagram,
};
