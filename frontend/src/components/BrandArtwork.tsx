type BrandIconArtworkProps = {
  compact?: boolean;
};

export function BrandIconArtwork({
  compact = false,
}: BrandIconArtworkProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: compact ? 8 : 36,
        background:
          "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
        boxShadow:
          "0 18px 60px rgba(14, 165, 233, 0.28)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: compact ? 13 : 66,
          fontWeight: 900,
          letterSpacing: compact ? -1 : -5,
          color: "#020617",
        }}
      >
        HA
      </div>
    </div>
  );
}

export function SocialImageArtwork() {
  const badges = [
    "ESP32",
    "ESP8266",
    "GPIO",
    "PWM",
    "ADC",
    "YAML",
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 58%, #052e2b 100%)",
        color: "#f8fafc",
        padding: 72,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -170,
          right: -110,
          width: 470,
          height: 470,
          display: "flex",
          borderRadius: 999,
          background:
            "rgba(16, 185, 129, 0.12)",
          border:
            "2px solid rgba(52, 211, 153, 0.16)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -210,
          right: 170,
          width: 430,
          height: 430,
          display: "flex",
          borderRadius: 999,
          background:
            "rgba(14, 165, 233, 0.10)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              display: "flex",
            }}
          >
            <BrandIconArtwork />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: -1,
              }}
            >
              HA Config Generator
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 7,
                fontSize: 18,
                color: "#94a3b8",
              }}
            >
              Visual configuration for Home Assistant
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 910,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.03,
              letterSpacing: -4,
            }}
          >
            ESPHome configs,
            built visually
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 25,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#cbd5e1",
            }}
          >
            Configure boards, pins, relays, sensors,
            networking and system features.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {badges.map((badge) => (
            <div
              key={badge}
              style={{
                display: "flex",
                marginRight: 12,
                border:
                  "1px solid rgba(148, 163, 184, 0.28)",
                borderRadius: 999,
                background:
                  "rgba(15, 23, 42, 0.72)",
                padding: "10px 18px",
                fontSize: 18,
                fontWeight: 700,
                color: "#a7f3d0",
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
