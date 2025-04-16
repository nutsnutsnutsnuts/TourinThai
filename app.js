//ใช้ express js จัดการเรื่อง web server
const express = require('express')
const path = require('path')
const router = require('./routes/myRouter')
const app = express() //จัดการเรื่องการสร้าง server, routing etc.
const { createProxyMiddleware } = require('http-proxy-middleware')

// Middleware to parse incoming requests
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(router) //ให้ express เรียกใช้ router
app.set('views', path.join(__dirname, 'views'))// อ้างอิงถึงตำแหน่ง folder views ที่ทำหน้าที่เก็บ template 
app.set('view engine', 'ejs')//ระบุ engine ที่ใช้
app.use(express.static(path.join(__dirname, 'public'))) //เป็นการใช้ express เพื่อเรียกใช้ static file จาก folder public โดยต้องมี index.html!


// Serve static files from the "asset" folder นำ css, Js, image จาก asset มาแสดงผล
app.use('/public', express.static(path.join(__dirname, 'public')));
const searchRouter = require('./routes/myRouter')

app.use('/', searchRouter)

// ตั้งค่า Proxy สำหรับเส้นทางที่ต้องการ
app.use('/proxy', (req, res, next) => {
    const imageUrl = req.query.url;  // รับ URL ของภาพจาก query parameters
  
    if (!imageUrl) {
      return res.status(400).send('Missing URL parameter');
    }
  
    // ใช้ createProxyMiddleware เพื่อสร้าง proxy ไปยัง URL ที่รับมาจาก query
    createProxyMiddleware({
      target: imageUrl,              // ตั้งค่า target เป็น URL ของภาพ
      changeOrigin: true,            // เปลี่ยน Origin header
      pathRewrite: {
        '^/proxy': '',               // เส้นทางที่ถูกเรียก /proxy จะถูกเปลี่ยนเป็นแค่ URL ของภาพ
      },
      onProxyReq: (proxyReq, req, res) => {
        // คุณสามารถปรับแต่งการร้องขอได้ที่นี่
        console.log(`Proxying request to: ${imageUrl}`);
      }
    })(req, res, next);  // เรียกใช้งาน proxy middleware
  });

app.listen(3000, ()=>{
    console.log("Start sever at port 3000!")
})