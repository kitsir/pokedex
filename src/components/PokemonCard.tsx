// src/components/PokemonCard.tsx
import React from "react";

type Props = {
  id: number;
  name: string;
  image: string;
  /** ปุ่มหลัก: จับเข้าคลัง (แสดงถ้าให้ onCatch) */
  onCatch?: () => void;
  /** ปุ่มหลัก: โอน/ลบออก (แสดงถ้าให้ onTransfer และไม่มี onCatch) */
  onTransfer?: () => void;
  /** ปุ่มแถวล่าง (Add to A/B, Battle ฯลฯ) */
  extraActions?: React.ReactNode;
  /** คลิกการ์ดเพื่อเปิดรายละเอียด */
  onOpen?: () => void;
  clickable?: boolean;
};

export default function PokemonCard({
  id,
  name,
  image,
  onCatch,
  onTransfer,
  extraActions,
  onOpen,
  clickable = true,
}: Props) {
  const goDetail = () => {
    if (onOpen) return onOpen();
    window.location.href = `/pokemon/${id}`;
  };

  return (
    <div
      className={`card white ${clickable ? "poke-card--clickable" : ""}`}
      style={{
        padding: 12,
        display: "grid",
        gap: 10,
        borderRadius: 14,
        transition: "transform .12s ease, box-shadow .18s ease, background .2s ease",
        boxShadow: "0 8px 24px rgba(0,0,0,.08)",
      }}
    >
      {/* ส่วนบน (กดเพื่อดูดีเทล) */}
      <div
        role={clickable ? "button" : undefined}
        onClick={clickable ? goDetail : undefined}
        onKeyDown={clickable ? (e) => { if (e.key === "Enter") goDetail(); } : undefined}
        tabIndex={clickable ? 0 : -1}
        style={{ display: "grid", gap: 8, justifyItems: "center", cursor: clickable ? "pointer" : "default" }}
        aria-label={`Open ${name} detail`}
      >
        <img src={image} alt={name} width={160} height={160}
             style={{ width: 160, height: 160, objectFit: "contain" }} loading="lazy" />
        <div style={{ fontWeight: 800, fontSize: 18, textTransform: "capitalize" }}>{name}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>#{id}</div>
      </div>

      {/* ปุ่มหลักแถวบน: แสดง Catch ถ้ามี onCatch, ไม่งั้นลองใช้ onTransfer */}
      {onCatch ? (
        <button className="pill filled" onClick={onCatch} style={{ width: "100%" }} title="Catch to My Pokémon">
          🎯 Catch
        </button>
      ) : onTransfer ? (
        <button className="pill outline danger" onClick={onTransfer} style={{ width: "100%" }} title="Transfer out">
          ⤴ Transfer
        </button>
      ) : null}

      {/* เส้นแบ่ง */}
      {extraActions && <div style={{ height: 1, background: "rgba(0,0,0,.06)", marginTop: 4 }} />}

      {/* ปุ่มแถวล่าง (สองปุ่ม) */}
      {extraActions && (
        <div className="poke-card-actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {extraActions}
        </div>
      )}
    </div>
  );
}
