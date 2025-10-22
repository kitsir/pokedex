import { Link } from "react-router-dom";

export default function About() {
  const Row = (label: string, value: string) => (
    <div style={{display:"grid", gridTemplateColumns:"140px 1fr", gap:12}}>
      <div style={{color:"#64748b"}}>{label}</div>
      <div>{value}</div>
    </div>
  );

  return (
    <section>
      {/* ========== HERO: DEV INFO ========== */}
      <div className="card white" style={{padding:24, marginBottom:16}}>
        <div style={{display:"grid", gridTemplateColumns:"140px 1fr", gap:20, alignItems:"center"}}>
          <div>
            <div style={{
              width:140, height:140, borderRadius:16, overflow:"hidden",
              background:"#f3f4f6", border:"2px solid #e5e7eb"
            }}>
              {/* วางไฟล์รูปไว้ที่ public/kit1.jpg (หรือแก้เป็น /kit1.png ให้ตรงกับไฟล์จริง) */}
              <img
                src="/kit1.jpg"
                alt="kit visaskamin"
                style={{width:"100%", height:"100%", objectFit:"cover"}}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          </div>

          <div>
            <h1 style={{margin:"0 0 6px"}}>kit visaskamin</h1>
            <div style={{color:"#64748b", marginBottom:12}}>
              Front-End Developer • React / TypeScript
            </div>

            <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
              <a className="pill filled" href="mailto:you@example.com">Email</a>
              <a className="pill outline" href="https://github.com/kitsir" target="_blank">GitHub</a>
              <a className="pill outline" href="https://www.linkedin.com/in/kit-visaskamin-760755384/" target="_blank">LinkedIn</a>
              <Link className="pill outline" to="/">Back to Home</Link>
            </div>
          </div>
        </div>

        <hr style={{border:"none", borderTop:"2px solid #f1f5f9", margin:"20px 0"}} />

        <div style={{display:"grid", rowGap:10}}>
          {Row("ชื่อ", "kit visaskamin")}
          {Row("บทบาท", "Front-End Developer / React + TypeScript")}
          {Row("อีเมล", "kit.visaskamin@gmail.com")}
          {Row("ที่อยู่/โซนเวลา", "Bangkok (UTC+7)")}
        </div>
      </div>

      {/* ========== PROJECT OVERVIEW ========== */}
      <div className="card white" style={{padding:24, marginBottom:16}}>
        <h2 style={{marginTop:0}}>รายละเอียดโปรเจกต์</h2>
        <p style={{color:"#64748b"}}>
          โปรเจกต์นี้เป็นเว็บแอปพลิเคชันสำหรับค้นหาและแสดงข้อมูลโปเกมอนจาก <strong>PokeAPI</strong>
          พัฒนาด้วยเทคโนโลยีสมัยใหม่เพื่อให้การใช้งานลื่นไหล ตอบสนองไว และโครงสร้างโค้ดอ่านง่าย
          ธีมหลักเป็นโทนสีขาว–แดง พร้อมพื้นหลัง “แผนที่พิกเซล” ให้บรรยากาศเกมยุคคลาสสิก
        </p>
      </div>

      {/* ========== STACK / FEATURES / DATA FLOW / STRUCTURE ========== */}
      <div className="card white" style={{padding:24, marginBottom:16}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:14}}>
          {/* Tech Stack */}
          <div className="card white" style={{padding:16}}>
            <strong>🛠️ เทคโนโลยีที่ใช้</strong>
            <ul style={{marginTop:8}}>
              <li><strong>Build Tool:</strong> Vite</li>
              <li><strong>Framework:</strong> React + TypeScript</li>
              <li><strong>Routing:</strong> React Router DOM</li>
              <li><strong>State Management:</strong> React Hooks + <code>localStorage</code> (My Pokémon)</li>
              <li><strong>Styling:</strong> ธีมขาว–แดง + CSS Gradients (แผนที่พิกเซล), react-hot-toast, react-icons</li>
              <li><strong>Data Source:</strong> PokeAPI</li>
            </ul>
          </div>

          {/* Features */}
          <div className="card white" style={{padding:16}}>
            <strong>✨ ฟีเจอร์หลัก</strong>
            <ul style={{marginTop:8}}>
              <li>ค้นหาและเรียกดูรายชื่อโปเกมอน พร้อมรูป <em>Official Artwork</em></li>
              <li>หน้ารายละเอียด: Types / Base Stats / Abilities</li>
              <li>เพิ่ม/ลบ “ทีมของฉัน” และบันทึกใน <code>localStorage</code></li>
              <li>เปลี่ยนหน้าแบบ Prev/Next และค้นหาตามชื่อ</li>
              <li>Skeleton Loading, สถานะว่าง/ผิดพลาด และ Responsive Design</li>
              <li>ปุ่มเม็ดยาโทนขาว–แดง (press-effect) + Ribbon “Details”</li>
            </ul>
          </div>

          {/* Data & Structure */}
          <div className="card white" style={{padding:16}}>
            <strong>🔎 โครงสร้างข้อมูล & การทำงาน</strong>
            <ul style={{marginTop:8}}>
              <li>รายการ: <code>/pokemon?limit,offset</code>, รายตัว: <code>/pokemon/:id</code></li>
              <li>แปลง URL → <code>id</code> เพื่อประกอบลิงก์รูป Official Artwork</li>
              <li>จัดการ state ด้วย Hooks และเก็บทีมผู้ใช้ด้วย <code>localStorage</code></li>
            </ul>

            <strong>🧩 โครงสร้างโปรเจกต์</strong>
            <pre style={{marginTop:8, background:"#f8fafc", border:"2px solid #e5e7eb", borderRadius:12, padding:12, overflow:"auto"}}>
{`src/
  api/            // ฟังก์ชันเรียก PokeAPI (listPokemon, getPokemon, ฯลฯ)
  components/     // การ์ด, สเกเลตัน, ฯลฯ
  pages/          // Home, PokemonDetail, MyPokemon, About
  store/          // favorites.ts (บันทึกทีมใน localStorage)
  types/          // TypeScript types ของข้อมูล`}
            </pre>
          </div>
        </div>
      </div>

      {/* ========== DEV DETAILS ========== */}
      <div className="card white" style={{padding:24, marginBottom:16}}>
        <h3 style={{marginTop:0}}>รายละเอียดการพัฒนา</h3>
        <ul>
          <li><strong>โครงหน้าเว็บ:</strong> Home, Pokémon Detail, My Pokémon, About</li>
          <li><strong>การเชื่อมต่อข้อมูล (API):</strong> ใช้ <code>/pokemon?limit,offset</code> สำหรับรายการ และ <code>/pokemon/:id</code> สำหรับข้อมูลเชิงลึก พร้อมแปลง URL เพื่อระบุ <code>id</code> สำหรับรูป Official Artwork</li>
          <li><strong>การจัดการสถานะฝั่งไคลเอนต์:</strong> ใช้ React Hooks ร่วมกับ <code>localStorage</code> เพื่อบันทึก “ทีมของฉัน”</li>
          <li><strong>ระบบส่วนติดต่อผู้ใช้ (UI System):</strong> การ์ดพื้นขาว ป้ายริบบิ้นสีแดง “Details” และปุ่มทรงเม็ดยาโทนขาว–แดงให้สอดคล้องทั่วทั้งเว็บไซต์</li>
          <li><strong>สถานะการแสดงผล:</strong> รองรับช่วงโหลดด้วย Skeleton และแสดงข้อความในกรณีไม่มีข้อมูลหรือเกิดข้อผิดพลาด</li>
        </ul>
      </div>

      {/* ========== SETUP / RUN ========== */}
      <div className="card white" style={{padding:24}}>
        <h3 style={{marginTop:0}}>การติดตั้งและใช้งาน</h3>
        <pre style={{marginTop:8, background:"#f8fafc", border:"2px solid #e5e7eb", borderRadius:12, padding:12, overflow:"auto"}}>
{`npm i
npm run dev    # โหมดพัฒนา
npm run build  # สร้างไฟล์พร้อมเผยแพร่`}
        </pre>
      </div>
    </section>
  );
}
