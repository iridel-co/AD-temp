import { notFound } from "next/navigation"

// Route hidden for the event build. Remove this layout to bring it back.
export default function HiddenLayout() {
  notFound()
}
