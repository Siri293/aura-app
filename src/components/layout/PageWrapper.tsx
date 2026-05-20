interface PageWrapperProps {
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string;
}

export default function PageWrapper({
  children,
  maxWidth = "900px",
  padding = "32px",
}: PageWrapperProps) {
  return (
    <div
      style={{
        maxWidth,
        margin: "0 auto",
        padding,
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}