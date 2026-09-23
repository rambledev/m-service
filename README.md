# m-service

ระบบแจ้งซ่อมภายในมหาวิทยาลัย (University Maintenance Service) — **Demo Prototype**

สร้างด้วย Next.js (App Router) + TypeScript + Tailwind CSS โดยใช้ **Mock Data** ทั้งหมด
ยังไม่เชื่อมต่อฐานข้อมูลจริง แต่วางโครงสร้างโค้ดให้พร้อมต่อยอดด้วย Prisma ORM + PostgreSQL ในอนาคต

## วิธี Run

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000) ระบบจะพาไปที่หน้า Login โดยอัตโนมัติ

> ก่อนใช้งาน login ได้ ต้องตั้งค่า Google OAuth Client ก่อน — ดูหัวข้อ [เข้าสู่ระบบด้วย Google](#เข้าสู่ระบบด้วย-google) ด้านล่าง

คำสั่งอื่น ๆ ที่ใช้บ่อย:

```bash
npm run build   # ตรวจสอบ type และ build โปรดักชัน
npm run lint    # ตรวจสอบโค้ดด้วย ESLint
```

> หมายเหตุ: ข้อมูลทั้งหมด (ผู้ใช้, รายการแจ้งซ่อม) เป็น Mock Data ที่เก็บไว้ใน `localStorage` ของเบราว์เซอร์
> หากต้องการล้างข้อมูลกลับไปเป็นค่าเริ่มต้น ให้ล้าง Site Data / localStorage ของ `localhost:3000` แล้วรีเฟรชหน้าเว็บ

## เข้าสู่ระบบด้วย Google

ระบบใช้ Google OAuth จริง (Auth.js / next-auth v5) — ไม่มีรหัสผ่านแยกของระบบเอง และไม่มีปุ่มเลือกบทบาท
อีกต่อไป **เข้าได้เฉพาะบัญชี Google ที่อยู่ใน allowlist ที่ `lib/roles.ts`** เท่านั้น บัญชีอื่นจะถูกปฏิเสธ
ตั้งแต่ขั้นตอน sign-in (เห็นข้อความแจ้งเตือนที่หน้า Login) โดยไม่มีทางเข้าระบบได้เลย

| บทบาท | อีเมล |
|---|---|
| Admin | `techodev.2024@gmail.com`, `sakolsupa.te@rmu.ac.th` |
| ผู้แจ้งซ่อม | `techo@rmu.ac.th` |
| ช่างซ่อม | `cc.claude3@rmu.ac.th` |

การเพิ่ม/ถอดสิทธิ์บัญชี หรือเปลี่ยนบทบาท ให้แก้ที่ `lib/roles.ts` โดยตรง (เป็นไฟล์เดียวที่กำหนด
role ของแต่ละอีเมล — ทั้ง auth callback และหน้า "จัดการผู้ใช้งาน" อ่านค่าจากไฟล์นี้) ชื่อที่แสดงในระบบจะ
อัปเดตเป็นชื่อจริงจากบัญชี Google โดยอัตโนมัติเมื่อบัญชีนั้น sign in ครั้งแรก

### ตั้งค่า Google OAuth Client (จำเป็นก่อนใช้งาน)

1. ไปที่ [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   → **Create Credentials → OAuth client ID** → เลือก Application type **"Web application"**
2. ใส่ **Authorized JavaScript origins**: `http://localhost:3000`
   และ **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
3. คัดลอกค่า Client ID / Client secret มาใส่ใน `.env`:
   ```
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   ```
   ค่า `AUTH_SECRET` มีการ generate ไว้ให้แล้วใน `.env` ไม่ต้องแก้ไข (ดูคำอธิบายเพิ่มเติมใน `.env.example`)

กดปุ่ม **"ออกจากระบบ"** ที่มุมขวาบนได้ทุกหน้า เพื่อออกจากระบบ (sign out จาก Google session ของระบบนี้ด้วย)

## Flow การใช้งาน (Demo Scenario)

> ต้อง sign in ด้วยบัญชี Google ที่ตรงกับบทบาทนั้น ๆ ตามตารางด้านบน (คนละบทบาทคือคนละบัญชี Google จริง
> จึงต้อง sign out แล้ว sign in ใหม่ด้วยอีกบัญชีเพื่อสลับบทบาท)

1. **เข้าสู่ระบบด้วยบัญชีผู้แจ้งซ่อม** (`techo@rmu.ac.th`) → เมนู "แจ้งซ่อมใหม่" → กรอกฟอร์ม เช่น
   ประเภทงาน "เครื่องปรับอากาศ" รายละเอียด "แอร์ห้องประชุมไม่เย็น" → กด "ส่งแจ้งซ่อม"
   ระบบจะสร้างเลขที่ใบแจ้งซ่อม (เช่น `MS-2569-00016`) และสถานะเริ่มต้นเป็น **"รอดำเนินการ"**

2. **ออกจากระบบแล้วเข้าสู่ระบบใหม่ด้วยบัญชีช่างซ่อม** (`cc.claude3@rmu.ac.th`) → แดชบอร์ดจะเห็นงานใหม่ที่เพิ่งแจ้งเข้ามา
   → เปิดรายการ → กด **"รับงาน"** (สถานะเปลี่ยนเป็น "เจ้าหน้าที่รับเรื่องแล้ว")
   → กด **"เริ่มดำเนินการ"** (สถานะเปลี่ยนเป็น "กำลังดำเนินการ")
   → กรอกหมายเหตุการซ่อม เช่น "เปลี่ยนอะไหล่ชุดควบคุมไฟ" → กด **"งานเสร็จสิ้น"**
   (สถานะเปลี่ยนเป็น "ดำเนินการเสร็จสิ้น")

3. **ออกจากระบบแล้วเข้าสู่ระบบใหม่ด้วยบัญชี Admin** (`techodev.2024@gmail.com` หรือ `sakolsupa.te@rmu.ac.th`)
   → ดูภาพรวมที่แดชบอร์ด (จำนวนงานทั้งหมด/รอดำเนินการ/กำลังซ่อม/เสร็จสิ้น/ยกเลิก)
   → เปิด "จัดการรายการซ่อม" เพื่อกรองตามสถานะ/ประเภทงาน และมอบหมายช่าง
   → เปิด "รายงาน" เพื่อดูกราฟจำนวนงานแยกตามประเภท และทดลองปุ่ม Export (Demo)

4. **ยกเลิกรายการ**: ที่หน้ารายละเอียดของผู้แจ้งซ่อม (สถานะที่ยังไม่เสร็จสิ้น) มีปุ่ม "ยกเลิกรายการ"
   เมื่อกดจะต้องระบุเหตุผล และระบบจะบันทึกผู้ยกเลิก วันเวลา และเหตุผลไว้ใน Timeline

## การแจ้งเตือนช่างซ่อมทางอีเมล

เมื่อผู้แจ้งซ่อมกด "ส่งแจ้งซ่อม" ระบบจะยิงคำขอไปที่ `app/api/notify-technicians/route.ts`
(Next.js Route Handler ฝั่งเซิร์ฟเวอร์ ใช้ [nodemailer](https://nodemailer.com)) เพื่อส่งอีเมลแจ้งเตือน
ไปยังช่างซ่อมทุกคนจริง (ไม่ใช่ Demo จำลอง) — เป็น fire-and-forget ไม่บล็อกการสร้างตั๋ว ถ้าส่งไม่สำเร็จ
ผู้แจ้งซ่อมจะไม่เห็น error ใด ๆ (แค่ log ไว้ที่ server console) เพราะอีเมลเป็น side effect เบื้องหลัง

### ตั้งค่า SMTP

เพิ่มค่าเหล่านี้ใน `.env` (ดูตัวอย่างและคำอธิบายใน `.env.example`):

```
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=m-service <...>
```

ใช้ได้กับ SMTP account ใด ๆ เช่น Gmail (ต้องสร้าง [App Password](https://myaccount.google.com/apppasswords))
หรือเมลเซิร์ฟเวอร์ของหน่วยงาน — ไม่จำเป็นต้องใช้บริการใดบริการหนึ่งโดยเฉพาะ **ถ้าไม่ตั้งค่า SMTP ไว้
ระบบยังทำงานได้ปกติทุกอย่าง** เพียงแต่ endpoint จะตอบกลับว่า "ยังไม่ได้ตั้งค่าเซิร์ฟเวอร์อีเมล" แทนการส่งจริง

> **อีเมลช่างซ่อมคือบัญชีจริงจาก `lib/roles.ts`**: ระบบส่งไปยังทุกอีเมลที่มีบทบาท "ช่างซ่อม" ใน allowlist
> (ปัจจุบันคือ `cc.claude3@rmu.ac.th`) ถ้าต้องการทดสอบการส่งโดยไม่รบกวนช่างซ่อมจริง ให้ตั้งค่า
> `NOTIFY_OVERRIDE_EMAIL=your-real-email@...` ใน `.env` — ระบบจะส่งทุกฉบับไปที่อีเมลนี้แทน

## ป้องกันรับงานซ้อนกัน (รับงานพร้อมกันหลายคนไม่ได้)

ปุ่ม "รับงาน" ของช่างซ่อมเช็คสถานะล่าสุดของตั๋วก่อนยืนยันเสมอ ไม่ใช่แค่เชื่อข้อมูลที่ค้างอยู่บนหน้าจอ:

- ระบบยังไม่มี Backend/Database จริง (ข้อมูลอยู่ใน `localStorage` ของเบราว์เซอร์) จึงจำลอง "realtime"
  ด้วยสองกลไกร่วมกันใน `context/AppContext.tsx`:
  1. **ฟัง `storage` event ข้าม tab** — ถ้าเปิดระบบไว้หลาย tab/หน้าต่างบนเบราว์เซอร์เดียวกัน (เช่น เปิดจำลองช่าง
     สองคนพร้อมกันเพื่อทดสอบ) การเปลี่ยนแปลงจาก tab หนึ่งจะ sync ไปอีก tab ทันทีอัตโนมัติ
  2. **อ่าน localStorage ตรง ๆ ตอนกด "รับงาน"** แทนที่จะเชื่อ state ที่ค้างอยู่บนหน้าจอ — ปิดช่องว่างเวลา
     ระหว่างที่ storage event ยังมาไม่ถึงกับตอนที่ผู้ใช้กดปุ่ม ทำให้เช็คสถานะล่าสุดจริง ๆ ก่อนยืนยันเสมอ
- ถ้าตั๋วนั้นถูกรับไปแล้ว (ไม่ใช่สถานะ "รอดำเนินการ" อีกต่อไป) ปุ่ม "รับงาน" จะหายไปเองพร้อมข้อความ
  "งานนี้ถูกมอบหมายให้ ... แล้ว" โดยไม่ต้องกดเลย (กรณีปกติที่ sync ทัน) หรือถ้ากดพอดีจังหวะเดียวกัน
  จะขึ้น Toast แจ้งเตือนสีแดง "รับงานไม่สำเร็จ: ... รับงานนี้ไปแล้ว" ส่วนฝั่งที่รับสำเร็จจะขึ้น Toast
  สีเขียว "รับงาน ... สำเร็จ" — ทดสอบแล้วด้วยการจำลอง 2 tab กดรับงานพร้อมกันหลายรอบ มีผู้ชนะแค่คนเดียวเสมอ

## โครงสร้างโปรเจกต์

```
app/
 ├── login/                 หน้าเข้าสู่ระบบด้วย Google (Auth.js / next-auth v5)
 ├── api/auth/[...nextauth]/ Route Handler ของ Auth.js (Google OAuth callback)
 ├── requester/              ผู้แจ้งซ่อม: dashboard, create, tickets, detail/[id]
 ├── technician/              ช่างซ่อม: dashboard, jobs, jobs/[id]
 ├── admin/                  Admin: dashboard, tickets, users, reports
 └── api/notify-technicians/  Route Handler ส่งอีเมลแจ้งเตือนช่างซ่อม (nodemailer)

components/    Header, TopTabs, BottomTabBar, AppShell, StatusTimeline, TicketCard, RepairForm,
               DashboardCard, ImageUploader, Toast ฯลฯ
context/       AppContext — จำลอง state ของระบบ (currentUser มาจาก Google session จริง, รายการแจ้งซ่อม
               ยังอยู่ใน localStorage เหมือนเดิม)
mock/          ข้อมูลจำลอง: tickets.ts, categories.ts, users.ts (สร้างรายชื่อจาก lib/roles.ts เท่านั้น)
lib/           types.ts, ticket-utils.ts (สถานะ, รูปแบบวันที่, เลขที่ใบแจ้งซ่อม ฯลฯ), roles.ts (allowlist
               อีเมล → บทบาท ที่ auth.ts ใช้ตัดสิน sign-in)
auth.ts        ตั้งค่า Auth.js (Google provider, signIn allowlist, JWT/session callbacks)
prisma/
 ├── schema.prisma           models: User, Category, Ticket, TicketImage, TicketEvent (+ relations)
 ├── seed.ts                 seed ข้อมูลชุดเดียวกับ mock/*.ts เข้า PostgreSQL
 └── migrations/              migration ที่ generate ไว้แล้ว (ทดสอบ apply + seed จริงแล้ว)
```

## ฐานข้อมูล (Prisma ORM v5 + PostgreSQL)

Schema ใน `prisma/schema.prisma` ถูกออกแบบให้ตรงกับ shape ของ `lib/types.ts` (`Ticket`, `User`,
`TicketEvent`, `TicketImage`) ทุกฟิลด์ พร้อม relation ครบ (`User` ↔ `Ticket` ทั้งฝั่งผู้แจ้ง/ช่าง,
`Ticket` ↔ `Category`, `Ticket` ↔ `TicketEvent`/`TicketImage`) และมี `prisma/seed.ts` ที่ import
ข้อมูลจาก `mock/categories.ts`, `mock/users.ts`, `mock/tickets.ts` โดยตรง — seed แล้วได้ผลลัพธ์
ตรงกับ Demo Flow เดิมทุกประการ (ทดสอบ apply migration + seed กับ PostgreSQL จริงแล้ว)

### วิธีเชื่อมต่อฐานข้อมูล

1. ตั้งค่า `DATABASE_URL` ใน `.env` ให้ชี้ไปยัง PostgreSQL ของคุณ (ดูตัวอย่างรูปแบบใน `.env`)
2. รัน migration (สร้างตารางตาม schema):

   ```bash
   npm run db:migrate
   ```

3. seed ข้อมูลตัวอย่าง (เหมือน Mock Data ที่ใช้ใน UI ทุกประการ):

   ```bash
   npm run db:seed
   ```

4. เปิดดูข้อมูลผ่าน Prisma Studio ได้ด้วย `npm run db:studio`

> `prisma/seed.ts` ใช้ `upsert` ทุกตาราง จึงรันซ้ำได้โดยไม่สร้างข้อมูลซ้ำ (idempotent)

### สถานะปัจจุบัน: ยังไม่ได้ต่อ UI เข้ากับฐานข้อมูลจริง

โปรเจกต์นี้ยัง**พร้อมเชื่อม** แต่ยังไม่ได้เชื่อมจริง — หน้าเว็บทั้งหมดยังอ่าน/เขียนผ่าน `localStorage`
ใน `context/AppContext.tsx` (ตามที่ออกแบบไว้สำหรับ Demo Prototype) เมื่อต้องการต่อยอดให้ใช้ฐานข้อมูลจริง
แนวทางที่แนะนำคือย้าย logic ใน `AppContext.tsx` (เช่น `createTicket`, `acceptTicket`, `completeTicket`,
`assignTechnician`, `cancelTicket`) ไปเป็น Server Actions หรือ Route Handlers ที่เรียกใช้
`@prisma/client` แทน โดยคง type `Ticket`/`User` ใน `lib/types.ts` ไว้เท่าเดิม เพื่อให้ Component ฝั่ง UI
ไม่ต้องแก้ไขมาก จุดที่ควรทราบ:

- `Ticket.id` คือเลขที่ใบแจ้งซ่อม (`MS-2569-00001`) ใช้เป็น Primary Key ตรง ๆ เหมือนใน mock data
- `Ticket.seq` เป็นเลขลำดับที่แอปเป็นผู้กำหนดเอง (ไม่ใช่ DB autoincrement) — ตอนสร้างตั๋วใหม่จริง ให้หาเลขถัดไปด้วย
  `tx.ticket.aggregate({ _max: { seq: true } })` ภายใน transaction ก่อนคำนวณ `id` แล้วค่อย `create`
- `requesterId` / `technicianId` / `actorId` เป็น optional FK ไปยัง `User` (ตั้งเป็น `null` ได้เมื่อไม่ตรงกับผู้ใช้ที่ลงทะเบียนไว้)
  ส่วนฟิลด์ชื่อ (`requesterName`, `technicianName`, `actorName`) เป็น snapshot เก็บไว้เสมอ
  เพื่อให้ประวัติ/Timeline อ่านได้แม้ผู้ใช้จะถูกลบหรือมอบหมายช่างใหม่ภายหลัง

## Docker

รัน PostgreSQL + Next.js (production build) ผ่าน Docker ได้ทั้งชุด — ทดสอบ build + migrate + seed +
serve จริงแล้ว (`docker compose up`, `docker compose run --rm migrate`)

### เตรียมไฟล์ .env

คัดลอก `.env.example` เป็น `.env` แล้วปรับรหัสผ่าน:

```bash
cp .env.example .env
```

`docker-compose.yml` อ่านค่า `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT`
จาก `.env` เพื่อตั้งค่า container ฐานข้อมูล และประกอบเป็น `DATABASE_URL` ภายใน network ของ Docker เอง
(`db:5432`) — ไม่ได้ใช้ค่า `DATABASE_URL` ในไฟล์ `.env` ตรง ๆ เพราะค่านั้นชี้ไปที่ `localhost:${POSTGRES_PORT}`
ซึ่งใช้ได้เฉพาะตอนรันจากเครื่อง host (เช่น `npm run dev`, `npx prisma studio`) เท่านั้น ดูรายละเอียดใน
comment ของ `docker-compose.yml` และ `.env`

### สั่งรัน

```bash
docker compose up -d --build      # เริ่ม PostgreSQL + Next.js app (http://localhost:3000)
docker compose run --rm migrate   # apply Prisma migration แล้ว seed ข้อมูลตัวอย่าง (รันครั้งแรกครั้งเดียว)
docker compose logs -f app        # ดู log ของแอป
docker compose down               # หยุดและลบ container (เพิ่ม -v เพื่อลบข้อมูลใน volume ด้วย)
```

`Dockerfile` เป็น multi-stage build (`deps` → `builder` → `runner`) ใช้ `output: "standalone"` ของ
Next.js เพื่อให้ image สุดท้าย (`runner`, ที่ service `app` ใช้) มีเฉพาะไฟล์ที่จำเป็นสำหรับรัน `node server.js`
ส่วน service `migrate` build จาก stage `builder` (มี Prisma CLI + source ครบ) และมี `profiles: ["tools"]`
จึงไม่ถูกสั่งรันอัตโนมัติตอน `docker compose up` — ต้องสั่งแยกด้วย `docker compose run --rm migrate` เอง
