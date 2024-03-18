import { z } from "zod"

const Schema = z.object({
    username: z.string(),
    language: z.string(),
    stdin: z.string(),
    src: z.string()
})

type postSchema = z.infer<typeof Schema>;
export type {postSchema}
export {Schema}