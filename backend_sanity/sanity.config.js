import { defineConfig } from "sanity";
import { deskTool } from 'sanity/desk'
import schemas from './schemas/schema'

export default defineConfig({
  title: "My Cool Project",
  projectId: "d0kna1ey",
  dataset: "production",
  plugins: [deskTool()],
  schema: {
    types: schemas,
  },
});