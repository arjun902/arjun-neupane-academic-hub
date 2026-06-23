import { resources, subjects } from "@/lib/data";

export function AdminActivityTable() {
  return (
    <Table headings={["Material", "Program", "Type", "Downloads", "Status"]}>
      {resources.slice(0, 5).map((item) => (
        <tr key={item.title}>
          <Td>{item.title}</Td>
          <Td>{item.program}</Td>
          <Td>{item.type}</Td>
          <Td>{item.downloads.toLocaleString()}</Td>
          <Td>
            <Status tone="green">Published</Status>
          </Td>
        </tr>
      ))}
    </Table>
  );
}

export function StudentSubjectsTable() {
  return (
    <Table headings={["Subject", "Program", "Latest update", "Status"]}>
      {subjects.slice(0, 5).map((subject, index) => (
        <tr key={subject.name}>
          <Td>{subject.name}</Td>
          <Td>{subject.program}</Td>
          <Td>{index % 2 ? "Lab feedback pending" : "Materials updated"}</Td>
          <Td>
            <Status tone={index % 2 ? "gold" : "green"}>{index % 2 ? "Action needed" : "On track"}</Status>
          </Td>
        </tr>
      ))}
    </Table>
  );
}

export function GradingTable() {
  return (
    <Table headings={["Subject", "Assessment", "Status", "Score", "Feedback"]}>
      <tr>
        <Td>Computer Networking</Td>
        <Td>Subnetting Lab</Td>
        <Td><Status tone="green">Reviewed</Status></Td>
        <Td>18 / 20</Td>
        <Td>Strong documentation; improve CIDR explanation.</Td>
      </tr>
      <tr>
        <Td>Java Programming</Td>
        <Td>OOP Assignment</Td>
        <Td><Status tone="gold">Pending resubmission</Status></Td>
        <Td>12 / 20</Td>
        <Td>Refactor class design and exception handling.</Td>
      </tr>
      <tr>
        <Td>DBMS</Td>
        <Td>ER Diagram</Td>
        <Td><Status tone="green">Published</Status></Td>
        <Td>16 / 20</Td>
        <Td>Good normalization; add relationship constraints.</Td>
      </tr>
      <tr>
        <Td>Research Methodology</Td>
        <Td>Proposal Draft</Td>
        <Td><Status tone="teal">In review</Status></Td>
        <Td>-</Td>
        <Td>Methodology feedback scheduled.</Td>
      </tr>
    </Table>
  );
}

function Table({ headings, children }: { headings: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="min-w-[740px] w-full border-collapse">
        <thead>
          <tr>
            {headings.map((heading) => (
              <th className="border-b border-line bg-teal/5 px-4 py-4 text-left text-xs font-extrabold uppercase text-navy" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-line px-4 py-4 text-sm text-slate-700 last:border-b-0">{children}</td>;
}

export function Status({ children, tone }: { children: React.ReactNode; tone: "green" | "gold" | "teal" }) {
  const className =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "gold"
        ? "bg-[#fff4dc] text-[#765019]"
        : "bg-teal/10 text-teal-deep";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${className}`}>{children}</span>;
}
