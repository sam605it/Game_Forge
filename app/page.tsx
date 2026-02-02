import dynamic from "next/dynamic";

const FigmaApp = dynamic(() => import("./figma/App"), {
  ssr: false,
});

export default function Page() {
  return <FigmaApp />;
}
