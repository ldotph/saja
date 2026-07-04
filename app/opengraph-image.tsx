import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "linear-gradient(145deg, #f8efe4 0%, #f1e7da 50%, #e4d1bc 100%)",
          color: "#171311",
          fontFamily: "Arial"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontSize: 28,
            fontWeight: 700,
            color: "#ad391b"
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 18,
              background: "#171311",
              color: "#fff7ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800
            }}
          >
            S
          </div>
          SAJA
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              maxWidth: "900px",
              fontSize: 88,
              lineHeight: 0.92,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "-0.06em"
            }}
          >
            Афиши ближайших концертов
          </div>
          <div
            style={{
              maxWidth: "740px",
              fontSize: 32,
              lineHeight: 1.35,
              color: "#61554f"
            }}
          >
            Фильтрация по городам, переход к площадке и форма для музыкантов с
            загрузкой афиши.
          </div>
        </div>
      </div>
    )
  );
}
