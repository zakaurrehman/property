import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { siteConfig } from "@/lib/site-config";

interface LeadConfirmationEmailProps {
  leadName: string;
  propertyTitle?: string;
}

export function LeadConfirmationEmail({
  leadName,
  propertyTitle,
}: LeadConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Thanks for reaching out to {siteConfig.name}</Preview>
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
            Thanks, {leadName}!
          </Heading>
          <Text style={{ color: "#0A0F1A" }}>
            We&apos;ve received your enquiry
            {propertyTitle ? ` about "${propertyTitle}"` : ""} and one of our agents will
            get back to you shortly — usually within a few hours during business hours
            (Mon–Sat, 9am–6pm).
          </Text>
          <Text style={{ color: "#0A0F1A" }}>
            If it&apos;s urgent, feel free to call or WhatsApp us directly at{" "}
            <strong>{siteConfig.phone}</strong>.
          </Text>
          <Hr style={{ borderColor: "#E7EAF0" }} />
          <Text style={{ color: "#8A94A6", fontSize: "12px" }}>
            {siteConfig.name} · {siteConfig.email}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default LeadConfirmationEmail;
