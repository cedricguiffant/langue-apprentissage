import NavBar from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-jp-dark">
      <NavBar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
