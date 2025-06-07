import type { Metadata } from "next";
import "@xyflow/react/dist/base.css";
import "./styling/globals.css";
import "./styling/configPanel.css";
import "./styling/react-flow/handles.css";
import "./styling/react-flow/nodes.css";

export const metadata: Metadata = {
  title: "Data Transformation Flow",
  description: "Data Transformation Flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
