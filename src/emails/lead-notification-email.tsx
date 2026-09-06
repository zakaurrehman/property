import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import { siteConfig } from "@/lib/site-config";

interface LeadNotificationEmailProps {
  leadName: string;
  leadPhone: string;
  leadEmail?: string;
  message?: string;
  propertyTitle?: string;
  propertyRefCode?: string;
  propertyUrl?: string;
  source: string;
}

export function LeadNotificationEmail({
  leadName,
  leadPhone,
  leadEmail,
  message,
  propertyTitle,
  propertyRefCode,
  propertyUrl,
  source,
}: LeadNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New enquiry from {leadName}
        {propertyTitle ? ` about ${propertyTitle}` : ""}
      </Preview>
      <Body style={{ backgroundColor: "#F6F7F9", fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "16px",
            margin: "40px auto",
          }}
        >
          <Heading style={{ color: "#0B1F3A", fontSize: "20px" }}>
            New enquiry — {source}
          </Heading>
          {propertyTitle && (
            <Text style={{ color: "#4A5568" }}>
              Property: <strong>{propertyTitle}</strong>{" "}
              {propertyRefCode ? `(${propertyRefCode})` : ""}
              {propertyUrl && (
                <>
                  {" "}
                  — <Link href={propertyUrl}>View listing</Link>
                </>
              )}
            </Text>
          )}
          <Hr style={{ borderColor: "#E7EAF0" }} />
          <Text style={{ color: "#0A0F1A" }}>
            <strong>Name:</strong> {leadName}
          </Text>
          <Text style={{ color: "#0A0F1A" }}>
            <strong>Phone:</strong> {leadPhone}
          </Text>
          {leadEmail && (
            <Text style={{ color: "#0A0F1A" }}>
              <strong>Email:</strong> {leadEmail}
            </Text>
          )}
          {message && (
            <Text style={{ color: "#0A0F1A" }}>
              <strong>Message:</strong> {message}
            </Text>
          )}
          <Hr style={{ borderColor: "#E7EAF0" }} />
          <Text style={{ color: "#8A94A6", fontSize: "12px" }}>
            Sent automatically by {siteConfig.name}. Reply to the lead directly by phone
            or WhatsApp.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default LeadNotificationEmail;
