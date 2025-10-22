export default function DevShowcase() {
  return (
    <section>
      <div className="card white" style={{padding:24}}>
        <h1 style={{marginTop:0}}>Dev Showcase</h1>
        <p style={{color:"#64748b"}}>
          หน้านี้รวบรวมการนำเสนอฟีเจอร์ และบันทึกกระบวนการพัฒนา (Presentation + Development Log)
          ของโปรเจกต์ Pokédex
        </p>

        <h3 style={{marginTop:16}}>🎯 ฟีเจอร์ที่ทำแล้ว</h3>
        <ul>
          <li>ดึงรายชื่อโปเกม่อนจาก PokeAPI พร้อมรูป Official Artwork</li>
          <li>หน้ารายละเอียดแสดงชนิด (Types), ค่าสเตต, ความสามารถ (Abilities)</li>
          <li>เพิ่ม/ลบทีมของฉัน (My Pokémon) ด้วย localStorage</li>
          <li>Skeleton Loaders, Toast แจ้งเตือน, ปุ่มกดแบบเม็ดยา กดแล้วจม</li>
          <li>พื้นหลังแผนที่พิกเซล + ธีมขาว-แดงทั่วทั้งเว็บ</li>
        </ul>

        <h3 style={{marginTop:16}}>🧪 ส่วนสาธิต (Demo)</h3>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:12}}>
          <div className="card white" style={{padding:16}}>
            <strong>การ์ด Pokémon</strong>
            <p style={{color:"#64748b"}}>ตัวอย่างการ์ดพร้อมริบบิ้น “Details” และปุ่ม Add</p>
          </div>
          <div className="card white" style={{padding:16}}>
            <strong>สเตตบาร์</strong>
            <p style={{color:"#64748b"}}>แถบค่าสเตตโทนแดงอ่อนบนพื้นขาว</p>
          </div>
          <div className="card white" style={{padding:16}}>
            <strong>ธีมแผนที่พิกเซล</strong>
            <p style={{color:"#64748b"}}>ถนนทรายตัดบนหญ้าสองเฉดสีเพื่ออารมณ์เกมยุคเก่า</p>
          </div>
        </div>

        <h3 style={{marginTop:16}}>🛠️ Development Log</h3>
        <ol>
          <li>ตั้งโปรเจกต์ Vite + React + TS → วางโครง Router</li>
          <li>เชื่อม PokeAPI → แสดงรายการ + รายละเอียด</li>
          <li>เพิ่ม My Pokémon ด้วย localStorage</li>
          <li>ออกแบบ UI ขาว-แดง, ปุ่มเม็ดยา, Ribbon “Details”</li>
          <li>เพิ่มหน้า About & Dev Showcase ให้สอดคล้องงาน</li>
        </ol>

        <div style={{marginTop:16}}>
          <a className="pill outline" href="/" >กลับหน้า Home</a>
        </div>
      </div>
    </section>
  );
}
