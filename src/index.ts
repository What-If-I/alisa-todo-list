import dotenv from 'dotenv';

import { Client } from '@notionhq/client';

dotenv.config();

if (!process.env.NOTION_TOKEN) throw "NOTION_TOKEN is required";
if (!process.env.NOTION_DB_ID) throw "NOTION_DB_ID is required";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;

export async function handler(
  event: { version: string; session: any; request: any },
  _: Object
) {
  const { version, session, request } = event;

  if (!request["original_utterance"]) {
    return {
      version,
      session,
      response: {
        text: "Привет! Что добавить в список?",
        end_session: false,
      },
    };
  }

  const task = request["original_utterance"]
    .toLowerCase()
    .replace("добавь", "")
    .replace("добавить", "")
    .replace("напомнить", "")
    .replace("напомни", "")
    .trim();

  await addTodo(capitalizeFirstLetter(task));

  return {
    version,
    session,
    response: {
      text: `Окей, добавила ${task} в список дел.`,
      end_session: true,
    },
  };
}

async function addTodo(name: string) {
  const notion = new Client({ auth: NOTION_TOKEN });

  await notion.pages.create({
    parent: { database_id: NOTION_DB_ID },
    properties: {
      Name: {
        type: "title",
        title: [{ type: "text", text: { content: name } }],
      },
      Status: { type: "select", select: { name: "To Do 🤖" } },
      Category: { type: "select", select: { name: "🕺 Personal" } },
      Priority: { type: "select", select: { name: "Не срочно" } },
    },
  });
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
