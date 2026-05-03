import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Loader2,
  ShoppingBag,
  MessageCircle,
  Phone,
  Send,
  Slack as SlackIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Status = "connected" | "missing_secrets" | "error" | "unknown";

interface ChannelReport {
  channel: string;
  label: string;
  status: Status;
  detail?: string;
  webhook_url?: string;
  required_secrets: string[];
  missing_secrets: string[];
  meta?: Record<string, unknown>;
}

interface ReportResponse {
  generated_at: string;
  domain: string;
  whatsapp_number: string;
  summary: { total: number; connected: number; missing_secrets: number; error: number };
  channels: ChannelReport[];
}

const ICONS: Record<string, typeof ShoppingBag> = {
  shopify: ShoppingBag,
  meta_facebook: MessageCircle,
  meta_instagram: MessageCircle,
  whatsapp: Phone,
  telegram_bot: Send,
  telegram_notify: Send,
  telegram_social: Send,
  telegram_marketing: Send,
  telegram_orders: Send,
  telegram_support: Send,
  slack: SlackIcon,
  gemini: Sparkles,
};

const SETUP_LINKS: Record<string, { label: string; url: string }[]> = {
  shopify: [
    { label: "Shopify Admin → Apps → Develop apps", url: "https://admin.shopify.com" },
    { label: "Generate Admin API token", url: "https://help.shopify.com/en/manual/apps/app-types/custom-apps" },
  ],
  meta_facebook: [
    { label: "Meta Business Suite", url: "https://business.facebook.com" },
    { label: "Meta for Developers — Webhooks", url: "https://developers.facebook.com/apps" },
  ],
  meta_instagram: [
    { label: "Connect IG to FB Page", url: "https://www.facebook.com/business/help/connect-instagram-to-page" },
    { label: "Instagram Graph API setup", url: "https://developers.facebook.com/docs/instagram-api/getting-started" },
  ],
  whatsapp: [
    { label: "WhatsApp Business Platform", url: "https://business.whatsapp.com" },
    { label: "Cloud API → Phone Numbers", url: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" },
  ],
  telegram_bot: [
    { label: "Telegram BotFather", url: "https://t.me/BotFather" },
    { label: "setWebhook docs", url: "https://core.telegram.org/bots/api#setwebhook" },
  ],
  telegram_notify: [{ label: "Telegram BotFather", url: "https://t.me/BotFather" }],
  telegram_social: [{ label: "Telegram BotFather", url: "https://t.me/BotFather" }],
  telegram_marketing: [{ label: "Telegram BotFather", url: "https://t.me/BotFather" }],
  telegram_orders: [{ label: "Telegram BotFather", url: "https://t.me/BotFather" }],
  telegram_support: [{ label: "Telegram BotFather", url: "https://t.me/BotFather" }],
  slack: [
    { label: "Slack — Your Apps", url: "https://api.slack.com/apps" },
    { label: "Event Subscriptions setup", url: "https://api.slack.com/apis/connections/events-api" },
  ],
  gemini: [{ label: "Google AI Studio — get API key", url: "https://aistudio.google.com/app/apikey" }],
};

function statusBadge(status: Status) {
  switch (status) {
    case "connected":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
        </Badge>
      );
    case "missing_secrets":
      return (
        <Badge className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100">
          <AlertTriangle className="w-3 h-3 mr-1" /> Missing secrets
        </Badge>
      );
    case "error":
      return (
        <Badge className="bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-100">
          <XCircle className="w-3 h-3 mr-1" /> Error
        </Badge>
      );
    default:
      return (
        <Badge className="bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-100">
          Unknown
        </Badge>
      );
  }
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success(`${label ?? "Value"} copied`);
        } catch {
          toast.error("Clipboard blocked");
        }
      }}
    >
      <Copy className="w-3 h-3 mr-1" /> Copy
    </Button>
  );
}

export default function AdminConnections() {
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke<ReportResponse>(
        "connections-status",
        { method: "POST", body: {} },
      );
      if (error) throw error;
      if (!data) throw new Error("Empty response");
      setReport(data);
    } catch (e) {
      toast.error(
        `Couldn't load connection status: ${e instanceof Error ? e.message : "unknown"}`,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getGroupKey = (channel: string): string => {
    if (channel.startsWith("meta_")) return "Meta (Facebook & Instagram)";
    if (channel.startsWith("telegram_")) return "Telegram Bots";
    switch (channel) {
      case "whatsapp":
        return "WhatsApp Business";
      case "shopify":
        return "Commerce";
      case "slack":
        return "Slack";
      default:
        return "AI";
    }
  };

  const grouped = (report?.channels ?? []).reduce<Record<string, ChannelReport[]>>(
    (acc, c) => {
      const key = getGroupKey(c.channel);
      acc[key] = acc[key] || [];
      acc[key].push(c);
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/shopify")}
              className="text-asper-stone hover:text-maroon"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="font-heading text-3xl text-maroon">Connections</h1>
              <p className="text-sm text-asper-stone mt-1">
                Live status of every channel wired to{" "}
                <span className="font-medium">asperbeautyshop.com</span>.
              </p>
            </div>
          </div>
          <Button
            onClick={() => void load()}
            disabled={refreshing}
            className="luxury-button-primary"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Re-check all
          </Button>
        </div>

        {loading && !report ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-maroon animate-spin" />
          </div>
        ) : report ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="neu-raised">
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wider text-asper-stone">
                    Total channels
                  </div>
                  <div className="text-3xl font-heading text-maroon mt-1">
                    {report.summary.total}
                  </div>
                </CardContent>
              </Card>
              <Card className="neu-raised">
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wider text-emerald-700">
                    Connected
                  </div>
                  <div className="text-3xl font-heading text-emerald-700 mt-1">
                    {report.summary.connected}
                  </div>
                </CardContent>
              </Card>
              <Card className="neu-raised">
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wider text-amber-700">
                    Missing secrets
                  </div>
                  <div className="text-3xl font-heading text-amber-700 mt-1">
                    {report.summary.missing_secrets}
                  </div>
                </CardContent>
              </Card>
              <Card className="neu-raised">
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wider text-rose-700">
                    Errors
                  </div>
                  <div className="text-3xl font-heading text-rose-700 mt-1">
                    {report.summary.error}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="mb-8 border-polished-gold/40 bg-polished-gold/5">
              <Sparkles className="w-4 h-4 text-polished-gold" />
              <AlertTitle className="text-maroon font-heading">
                One identity across every channel
              </AlertTitle>
              <AlertDescription className="text-sm text-asper-stone">
                WhatsApp <span className="font-medium">+962 79 065 6666</span>,
                Instagram{" "}
                <a
                  href="https://www.instagram.com/asper.beauty.shop/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-maroon"
                >
                  @asper.beauty.shop
                </a>
                , Facebook{" "}
                <a
                  href="https://www.facebook.com/AsperBeautyShop"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-maroon"
                >
                  AsperBeautyShop
                </a>
                , Telegram concierge, Slack workspace, and the Shopify storefront
                all funnel into the same{" "}
                <span className="font-medium">beauty-assistant</span> AI brain.
              </AlertDescription>
            </Alert>

            {Object.entries(grouped).map(([group, channels]) => (
              <section key={group} className="mb-10">
                <h2 className="font-heading text-xl text-maroon mb-4">{group}</h2>
                <div className="grid gap-4">
                  {channels.map((c) => {
                    const Icon = ICONS[c.channel] ?? Sparkles;
                    const setup = SETUP_LINKS[c.channel] ?? [];
                    return (
                      <Card key={c.channel} className="neu-raised">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-soft-ivory neu-flat flex items-center justify-center text-maroon">
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-heading text-maroon">
                                  {c.label}
                                </CardTitle>
                                {c.detail && (
                                  <CardDescription className="text-xs mt-1 text-asper-stone">
                                    {c.detail}
                                  </CardDescription>
                                )}
                              </div>
                            </div>
                            {statusBadge(c.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          {c.webhook_url && (
                            <div>
                              <div className="text-xs uppercase tracking-wider text-asper-stone mb-1">
                                Webhook URL (paste this into the platform)
                              </div>
                              <div className="flex items-center gap-2 bg-soft-ivory neu-inset rounded px-3 py-2 font-mono text-xs break-all">
                                <span className="flex-1">{c.webhook_url}</span>
                                <CopyButton value={c.webhook_url} label="Webhook URL" />
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-xs uppercase tracking-wider text-asper-stone mb-1">
                              Required secrets
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {c.required_secrets.map((s) => {
                                const missing = c.missing_secrets.includes(s);
                                return (
                                  <Badge
                                    key={s}
                                    variant="outline"
                                    className={
                                      missing
                                        ? "border-amber-300 text-amber-700 bg-amber-50"
                                        : "border-emerald-300 text-emerald-700 bg-emerald-50"
                                    }
                                  >
                                    {missing ? (
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                    )}
                                    {s}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>

                          {setup.length > 0 && (
                            <div>
                              <div className="text-xs uppercase tracking-wider text-asper-stone mb-1">
                                Setup
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {setup.map((s) => (
                                  <a
                                    key={s.url}
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-maroon hover:text-polished-gold underline underline-offset-2"
                                  >
                                    {s.label} <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}

            <p className="text-xs text-asper-stone text-center mt-12">
              Last checked {new Date(report.generated_at).toLocaleString()}
            </p>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
