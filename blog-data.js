/* --- KHO DỮ LIỆU BÀI VIẾT (BLOG DATA - PHIÊN BẢN MỞ RỘNG) --- */

const blogPosts = [
    {
        id: "tcp-vs-udp-http3",
        title: "TCP vs UDP: Từ Header gói tin đến Kỷ nguyên HTTP/3 (QUIC)",
        date: "28/12/2025",
        category: "study",
        image: "/images/blog/tcp-udp-http3.png", 
        summary: "Mổ xẻ tầng Transport Layer. Tại sao TCP lại có cơ chế 'Cửa sổ trượt'? Tại sao Head-of-Line Blocking lại giết chết hiệu năng Web và UDP đã cứu rỗi HTTP/3 như thế nào?",
        content: `
            <p><strong>1. Khởi nguồn: Sự thỏa hiệp của Internet</strong></p>
            <p>Khi Vint Cerf và Bob Kahn thiết kế TCP/IP vào những năm 70, họ đối mặt với một bài toán đánh đổi kinh điển: <strong>Độ tin cậy (Reliability)</strong> và <strong>Độ trễ (Latency)</strong> là hai kẻ thù không đội trời chung.</p>
            <p>Nếu bạn muốn dữ liệu chính xác 100%, bạn phải chấp nhận chờ đợi để kiểm tra và gửi lại. Nếu bạn muốn tốc độ tức thì, bạn phải chấp nhận rủi ro mất mát. Từ đó, tầng Transport Layer sinh ra hai nhánh:</p>
            <ul>
                <li><strong>TCP (Transmission Control Protocol):</strong> Dành cho Email, Web, File Transfer.</li>
                <li><strong>UDP (User Datagram Protocol):</strong> Dành cho Voice, Video, DNS, Gaming.</li>
            </ul>

            <h3>2. Deep Dive TCP: Không chỉ là "Bắt tay 3 bước"</h3>
            <p>Chúng ta thường nghe về quy trình bắt tay 3 bước (SYN -> SYN-ACK -> ACK). Nhưng sức mạnh thực sự của TCP nằm ở cơ chế <strong>Flow Control</strong> và <strong>Congestion Control</strong>.</p>
            
            <p><strong>Cơ chế Cửa sổ trượt (Sliding Window):</strong></p>
            <p>Hãy tưởng tượng Server đang quá tải, bộ nhớ đệm (Buffer) sắp tràn. Nếu Client cứ tiếp tục bắn dữ liệu sang, Server sẽ sập (Drop gói tin). Trong Header của TCP có một trường gọi là <code>Window Size</code> (16-bit).</p>
            <ul>
                <li>Server gửi ACK kèm thông điệp: <em>"Window Size = 0"</em>.</li>
                <li>Client nhận được sẽ hiểu: <em>"Server đang thở oxy, ngừng gửi ngay!"</em>.</li>
                <li>Client chuyển sang chế độ chờ (Probe), thỉnh thoảng hỏi thăm xem Server đã khỏe chưa.</li>
            </ul>
            <p class="quote-box">Đây là lý do TCP được gọi là giao thức "tử tế". Nó biết điều tiết lưu lượng để không làm sập mạng lưới.</p>

            <p><strong>Thuật toán Congestion Control: Từ Slow Start đến Fast Recovery</strong></p>
            <p>TCP không chỉ quan tâm đến Server, mà còn quan tâm đến cả "sức khỏe" của đường truyền mạng. Nếu mạng đang tắc nghẽn mà Client cứ bắn liên tục, toàn bộ Internet có thể sụp đổ (điều này đã xảy ra năm 1986 - sự kiện Congestion Collapse).</p>
            <p>TCP sử dụng thuật toán <strong>AIMD (Additive Increase Multiplicative Decrease)</strong>:</p>
            <ul>
                <li><strong>Slow Start:</strong> Ban đầu, Client gửi 1 gói tin. Nhận được ACK, tăng lên 2. Tiếp tục nhận ACK, tăng lên 4, 8, 16... (tăng theo cấp số nhân).</li>
                <li><strong>Congestion Avoidance:</strong> Khi đạt ngưỡng <code>ssthresh</code>, chuyển sang tăng tuyến tính (+1 mỗi RTT).</li>
                <li><strong>Fast Retransmit:</strong> Nếu nhận 3 ACK trùng lặp (duplicate ACK), TCP hiểu ngay có gói tin bị mất, gửi lại ngay mà không cần đợi timeout.</li>
                <li><strong>Fast Recovery:</strong> Sau khi retransmit, không quay về Slow Start mà chỉ giảm cửa sổ xuống 1/2, tiếp tục Congestion Avoidance.</li>
            </ul>
            <p>Điều này giúp TCP tự động điều chỉnh tốc độ truyền dựa trên trạng thái mạng thời gian thực.</p>

            <p><strong>Vấn đề Sequence Number Wraparound:</strong></p>
            <p>Trường Sequence Number của TCP chỉ có 32-bit (khoảng 4 tỷ giá trị). Với kết nối tốc độ cao (10 Gbps), con số này có thể bị "tràn" chỉ sau vài giây. Để giải quyết, TCP sử dụng cơ chế <strong>PAWS (Protection Against Wrapped Sequences)</strong> kèm theo Timestamp để phân biệt gói tin cũ và mới.</p>

            <h3>3. Deep Dive UDP: Sự tối giản đến cực đoan</h3>
            <p>Nếu Header của TCP dài tới <strong>20-60 bytes</strong> với đủ thứ cờ (Flags), Sequence Number, Checksum... thì Header của UDP chỉ vỏn vẹn <strong>8 bytes</strong>.</p>
            <p>UDP hoạt động theo nguyên lý <em>"Fire and Forget"</em> (Bắn và Quên). Nó không duy trì trạng thái kết nối (Stateless). Điều này giúp nó giảm tải CPU cực lớn cho Server. Hãy tưởng tượng một Game Server nhận hàng triệu tọa độ di chuyển mỗi giây:</p>
            <ul>
                <li><strong>Dùng TCP:</strong> Mất gói tin di chuyển số 1 -> Game dừng hình -> Chờ gửi lại -> Hiển thị. -> <strong>LAG.</strong></li>
                <li><strong>Dùng UDP:</strong> Mất gói tin số 1 -> Server bỏ qua -> Xử lý luôn gói tin số 2. -> Nhân vật có thể bị giật nhẹ (Interpolation) nhưng trải nghiệm vẫn mượt.</li>
            </ul>

            <p><strong>UDP trong thực tế: DNS Query</strong></p>
            <p>Bạn có bao giờ thắc mắc tại sao khi gõ <code>google.com</code> trình duyệt lại biết địa chỉ IP không? Đó là nhờ giao thức <strong>DNS (Domain Name System)</strong> - và DNS chạy trên UDP.</p>
            <p>Lý do: Một DNS Query chỉ cần 1 gói tin hỏi và 1 gói tin trả lời. Nếu dùng TCP, phải mất thêm 3 bước bắt tay và 4 bước ngắt kết nối (tổng cộng 7 gói tin!). Với UDP, chỉ cần 2 gói tin. Nếu không nhận được phản hồi, Client tự gửi lại (Application Layer retry).</p>

            <p><strong>UDP Hole Punching: Kỹ thuật xuyên tường lửa</strong></p>
            <p>Nhiều ứng dụng P2P (như Skype, WebRTC) sử dụng kỹ thuật <strong>UDP Hole Punching</strong> để kết nối trực tiếp giữa 2 máy client dù cả 2 đều nằm sau NAT/Firewall. Quy trình:</p>
            <ol>
                <li>Client A và B đều kết nối đến Server trung gian (STUN Server).</li>
                <li>Server cho biết địa chỉ IP Public và Port của từng Client.</li>
                <li>Client A gửi gói UDP đến IP:Port của B (gói này sẽ bị firewall của B chặn, nhưng nó tạo ra "lỗ thủng" trên NAT của A).</li>
                <li>Client B cũng làm tương tự.</li>
                <li>Giờ cả 2 có thể gửi gói tin trực tiếp cho nhau vì firewall đã "nhớ" luồng dữ liệu này.</li>
            </ol>

            <h3>4. Tại sao HTTP/3 lại chọn UDP? (Sự trỗi dậy của QUIC)</h3>
            <p>Suốt 30 năm, Web (HTTP/1.1 và HTTP/2) chạy trên nền TCP. Nhưng TCP có một nhược điểm chí mạng gọi là <strong>Head-of-Line Blocking (Tắc nghẽn đầu hàng)</strong>.</p>
            <p>Ví dụ: Bạn tải một trang web có 10 tấm ảnh. Trong TCP, các gói tin của 10 tấm ảnh này xếp thành một hàng dài. Nếu gói tin của <strong>Ảnh số 1 bị lỗi</strong>, toàn bộ hàng đợi phía sau (Ảnh 2 đến 10) dù đã tải xong vẫn phải <strong>đứng chờ</strong> gói số 1 được gửi lại. Một con sâu làm rầu nồi canh.</p>
            <p>Google đã tạo ra giao thức <strong>QUIC</strong> (nền tảng của HTTP/3) chạy trên <strong>UDP</strong> để phá bỏ giới hạn này. QUIC tự xây dựng cơ chế kiểm soát lỗi riêng ở tầng ứng dụng, cho phép các luồng dữ liệu chạy song song độc lập. Ảnh 1 lỗi thì chỉ ảnh 1 chờ, ảnh 2-10 vẫn hiển thị bình thường.</p>

            <p><strong>QUIC: Điểm đột phá thực sự</strong></p>
            <p>QUIC không chỉ giải quyết Head-of-Line Blocking, nó còn mang lại nhiều cải tiến khác:</p>
            <ul>
                <li><strong>0-RTT Connection Establishment:</strong> Với TCP + TLS, bạn cần 3 bước bắt tay TCP + 2-3 bước bắt tay TLS (tổng 5-6 RTT). QUIC cho phép gửi dữ liệu ngay trong gói tin đầu tiên nếu đã từng kết nối trước đó (0-RTT Resume).</li>
                <li><strong>Connection Migration:</strong> Bạn đang tải file qua WiFi, rồi chuyển sang 4G. Với TCP, kết nối sẽ đứt vì IP thay đổi. Với QUIC, kết nối được định danh bằng <code>Connection ID</code> thay vì IP:Port, nên có thể tiếp tục mượt mà.</li>
                <li><strong>Built-in Encryption:</strong> QUIC tích hợp sẵn TLS 1.3, bắt buộc mã hóa. Không còn HTTP plain text.</li>
            </ul>

            <p><strong>Thử nghiệm thực tế:</strong></p>
            <p>Theo báo cáo của Cloudflare, khi chuyển từ HTTP/2 (TCP) sang HTTP/3 (QUIC), thời gian tải trang giảm trung bình <strong>12-15%</strong> ở các khu vực có mạng kém chất lượng (mất gói tin cao). Với mạng ổn định, cải thiện khoảng 3-5%.</p>

            <h3>5. Kết luận: Không có giao thức "tốt nhất", chỉ có giao thức "phù hợp nhất"</h3>
            <p>TCP là lựa chọn an toàn khi bạn cần đảm bảo dữ liệu 100% chính xác (Banking, Email, File Download). UDP là vũ khí tối thượng khi độ trễ thấp quan trọng hơn độ chính xác (Gaming, Video Call). QUIC là tương lai của Web, kết hợp ưu điểm của cả hai.</p>
            <p class="quote-box">Bài học quan trọng: Hiểu rõ trade-off của từng công nghệ giúp bạn đưa ra quyết định thiết kế đúng đắn. Đừng cố dùng TCP cho game real-time, cũng đừng dùng UDP cho financial transaction.</p>
        `
    },
    {
        id: "multi-threading-deep-dive",
        title: "Đa luồng chuyên sâu: Context Switching & Thread Pool",
        date: "20/12/2025",
        category: "tech",
        image: "images/blog/thread pool.png",
        summary: "Tại sao tạo quá nhiều Thread lại khiến Server chậm đi thay vì nhanh hơn? Phân tích chi phí ẩn của Context Switching và kiến trúc Event Loop của Node.js.",
        content: `
            <p><strong>1. Ảo giác của sự song song</strong></p>
            <p>Chúng ta thường nghĩ CPU 8 nhân có thể chạy 1000 Thread cùng lúc. Thực tế không phải vậy. Tại một thời điểm nano giây, 1 nhân CPU chỉ chạy đúng 1 dòng lệnh của 1 Thread. Sự "song song" mà ta thấy thực chất là do CPU chuyển đổi qua lại giữa các Thread cực nhanh (Time Slicing).</p>

            <h3>2. Cái giá phải trả: Context Switching</h3>
            <p>Để chuyển từ Thread A sang Thread B, CPU phải thực hiện quy trình tốn kém gọi là <strong>Context Switching (Chuyển ngữ cảnh)</strong>:</p>
            <ol>
                <li><strong>Lưu trạng thái Thread A:</strong> Lưu vị trí dòng lệnh đang chạy (Program Counter), lưu các biến trong thanh ghi (Registers) vào RAM.</li>
                <li><strong>Nạp trạng thái Thread B:</strong> Đọc dữ liệu của B từ RAM nạp vào thanh ghi CPU.</li>
                <li><strong>Thực thi Thread B.</strong></li>
            </ol>
            <p>Quy trình này tốn khoảng vài micro giây. Nghe có vẻ nhanh, nhưng nếu bạn có 10.000 Thread tranh giành CPU, thì CPU sẽ dành <strong>90% thời gian chỉ để chuyển đổi qua lại</strong> và chỉ còn 10% để thực sự xử lý code. Đây là lý do mô hình <em>Thread-per-Request</em> truyền thống của Java sụp đổ khi gặp bài toán C10K (10.000 users).</p>

            <p><strong>Chi phí ẩn: Cache Invalidation</strong></p>
            <p>Context Switching không chỉ tốn thời gian copy dữ liệu. Nó còn có một chi phí ẩn khủng khiếp hơn: <strong>CPU Cache Miss</strong>.</p>
            <p>CPU hiện đại có 3 tầng cache (L1, L2, L3) để tránh phải đọc dữ liệu từ RAM chậm chạp. Khi Thread A đang chạy, CPU cache chứa đầy dữ liệu của A. Nhưng khi chuyển sang Thread B, cache trở nên vô dụng (Cache Miss). CPU phải đọc lại từ RAM, chậm hơn <strong>100-300 lần</strong>.</p>
            <p>Ví dụ thực tế: Một phép tính từ L1 Cache mất 1ns. Từ RAM mất 100ns. Nếu có 10.000 Thread liên tục chuyển đổi, tỷ lệ Cache Miss tăng vọt, làm chậm toàn hệ thống.</p>

            <h3>3. Bộ nhớ Stack (Stack Memory Overhead)</h3>
            <p>Trong Java, mỗi Thread khi sinh ra sẽ chiếm mặc định khoảng <strong>1MB RAM</strong> cho vùng nhớ Stack (để lưu biến cục bộ, hàm gọi đệ quy...).</p>
            <p><code>10.000 Threads x 1MB = 10GB RAM</code></p>
            <p>Chưa làm gì cả, Server đã mất trắng 10GB RAM. Nếu Server chỉ có 8GB RAM -> <strong>OutOfMemoryError</strong> ngay lập tức.</p>

            <p><strong>Kernel Threads vs User Threads</strong></p>
            <p>Không phải tất cả Thread đều tốn kém như nhau. Có 2 loại Thread:</p>
            <ul>
                <li><strong>Kernel Threads (OS Threads):</strong> Được quản lý bởi Hệ điều hành. Mỗi Thread tốn 1MB stack + tài nguyên kernel. Java truyền thống dùng loại này.</li>
                <li><strong>User Threads (Green Threads / Fibers):</strong> Được quản lý bởi Runtime (không phải OS). Nhẹ hơn nhiều, chỉ tốn vài KB. Go routines và Java Virtual Threads (Project Loom) dùng loại này.</li>
            </ul>
            <p>Ví dụ: Go có thể tạo hàng triệu goroutines vì mỗi goroutine chỉ tốn 2KB. Java 21 với Virtual Threads cũng đạt được điều tương tự.</p>

            <h3>4. Giải pháp: Thread Pool & Non-blocking I/O</h3>
            <p>Để khắc phục, chúng ta có 2 hướng đi hiện đại:</p>
            <ul>
                <li><strong>Cách 1 (Java hiện đại): Dùng Thread Pool.</strong> Thay vì mỗi khách 1 nhân viên, ta chỉ thuê cố định 50 nhân viên. Khách đông thì xếp hàng (Queue). Điều này giới hạn RAM sử dụng và giảm Context Switching.</li>
                <li><strong>Cách 2 (Node.js/Netty): Event Loop (Non-blocking).</strong> Chỉ dùng <strong>DUY NHẤT 1 Thread</strong> để nhận yêu cầu. Khi cần đọc Database hay File (I/O), Thread này không ngồi chờ mà ủy quyền cho Hệ điều hành làm, nó quay đi xử lý việc khác. Khi Hệ điều hành làm xong sẽ báo lại (Callback).</li>
            </ul>
            <p class="quote-box">Bài học thực chiến: Trong đồ án Chat LAN, mình sử dụng <code>ExecutorService.newFixedThreadPool(10)</code>. Dù cả lớp spam tin nhắn, Server vẫn chỉ dùng đúng 10 luồng và không bao giờ bị treo.</p>

            <p><strong>Phân tích chi tiết Thread Pool</strong></p>
            <p>Thread Pool không phải là giải pháp hoàn hảo. Bạn cần cấu hình đúng 3 thông số quan trọng:</p>
            <ul>
                <li><strong>Core Pool Size:</strong> Số Thread luôn sống (dù không có việc). Nên set = số CPU cores cho CPU-intensive tasks.</li>
                <li><strong>Max Pool Size:</strong> Số Thread tối đa có thể tạo. Khi Queue đầy, Thread Pool sẽ tạo thêm Thread đến con số này.</li>
                <li><strong>Queue Size:</strong> Kích thước hàng đợi. Nếu hàng đợi vô hạn (LinkedBlockingQueue), có thể gây OutOfMemory. Nên dùng ArrayBlockingQueue với giới hạn.</li>
            </ul>
            <p>Công thức kinh nghiệm:</p>
            <ul>
                <li><strong>CPU-bound tasks:</strong> Thread count = CPU cores (hoặc cores + 1)</li>
                <li><strong>I/O-bound tasks:</strong> Thread count = CPU cores × (1 + Wait time / Compute time). Ví dụ: 8 cores, task chờ I/O 90%, tính toán 10% → 8 × (1 + 9) = 80 threads.</li>
            </ul>

            <h3>5. Event Loop: Kiến trúc của Node.js</h3>
            <p>Node.js giải quyết bài toán C10K bằng cách hoàn toàn khác: <strong>Single-threaded Event Loop</strong>.</p>
            <p>Quy trình hoạt động:</p>
            <ol>
                <li>Main Thread nhận request từ 10.000 users.</li>
                <li>Gặp I/O (đọc file, query DB), Main Thread không chờ mà đăng ký một Callback với Event Loop.</li>
                <li>OS kernel thực hiện I/O ở background (dùng kernal threads).</li>
                <li>Main Thread tiếp tục nhận request khác.</li>
                <li>Khi I/O xong, Event Loop thông báo và Callback được thực thi.</li>
            </ol>
            <p>Điều kỳ diệu: Dù xử lý 10.000 users, Node.js chỉ dùng 1 Thread ở tầng Application. Chi phí Context Switching = 0.</p>

            <p><strong>Nhược điểm chết người của Event Loop</strong></p>
            <p>Event Loop chỉ hiệu quả với <strong>I/O-bound tasks</strong>. Nếu bạn có một CPU-bound task (ví dụ: tính số Fibonacci thứ 1 triệu), Main Thread sẽ bị block. Toàn bộ 10.000 users phải chờ đợi task đó hoàn thành.</p>
            <p>Giải pháp: Dùng <strong>Worker Threads</strong> (trong Node.js) hoặc tách task CPU-intensive ra microservice riêng.</p>

            <h3>6. So sánh thực chiến: Java vs Node.js vs Go</h3>
            <p>Mình đã thử nghiệm một Server đơn giản trả về "Hello World":</p>
            <ul>
                <li><strong>Java (Thread-per-Request):</strong> 10.000 requests đồng thời → RAM tăng vọt 3GB, CPU 80% chỉ để Context Switch. Response time: 500ms.</li>
                <li><strong>Java (ExecutorService với 200 threads):</strong> RAM ổn định 500MB, CPU 30%. Response time: 50ms.</li>
                <li><strong>Node.js (Event Loop):</strong> RAM 150MB, CPU 20%. Response time: 20ms. Nhưng khi thêm task tính Fibonacci, response time tăng lên 5000ms (block).</li>
                <li><strong>Go (Goroutines):</strong> RAM 200MB, CPU 25%. Response time: 15ms. Xử lý tốt cả I/O và CPU-bound tasks.</li>
            </ul>

            <h3>7. Java 21: Cuộc cách mạng Virtual Threads</h3>
            <p>Java 21 giới thiệu <strong>Project Loom</strong> với Virtual Threads (Fibers). Đây là game changer:</p>
            <ul>
                <li>Bạn có thể tạo hàng triệu Virtual Threads mà không lo OutOfMemory.</li>
                <li>Code vẫn viết theo style blocking truyền thống (dễ đọc), nhưng runtime tự động chuyển thành non-blocking.</li>
                <li>Mỗi Virtual Thread chỉ tốn vài KB RAM.</li>
            </ul>
            <p>Ví dụ code:</p>
            <pre><code>try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1_000_000; i++) {
        executor.submit(() -> {
            // Blocking call, nhưng không block OS thread
            String result = httpClient.send(request);
            System.out.println(result);
        });
    }
}</code></pre>
            <p>1 triệu Virtual Threads chỉ map xuống vài chục OS Threads. Đây là sự kết hợp hoàn hảo giữa kiến trúc Event Loop (hiệu năng) và Thread model (dễ viết code).</p>

            <p class="quote-box">Kết luận: Trong tương lai, ranh giới giữa "Thread-based" và "Event-based" sẽ mờ dần. Virtual Threads và Goroutines chứng minh rằng bạn có thể có cả hai: Code đơn giản + Hiệu năng cao.</p>
        `
    },
    {
        id: "rmi-rpc-grpc-history",
        title: "Sự tiến hóa của Hệ thống phân tán: Từ RMI đến gRPC",
        date: "15/12/2025",
        category: "study",
        image: "images/blog/RMI vs Grpc.png",
        summary: "Tại sao chúng ta lại học RMI - công nghệ từ năm 1990? Bởi vì nó là cha đẻ của tư duy Microservices. Phân tích quá trình Marshalling và sự ra đời của gRPC.",
        content: `
            <p><strong>1. Vấn đề của ứng dụng hiện đại</strong></p>
            <p>Trong kỷ nguyên Monolith (nguyên khối), mọi đoạn code đều nằm chung một bộ nhớ, gọi hàm <code>functionA()</code> tốn 0ms. Nhưng trong kỷ nguyên Microservices, Service A (Order) nằm ở Mỹ cần gọi Service B (Payment) nằm ở Singapore. Lời gọi hàm giờ đây phải đi qua nửa vòng trái đất.</p>
            <p>Làm sao để việc gọi hàm qua mạng (Remote) cảm giác tự nhiên như gọi hàm nội bộ (Local)? Đó là mục tiêu của <strong>RPC (Remote Procedure Call)</strong>.</p>

            <h3>2. Mổ xẻ Java RMI (Remote Method Invocation)</h3>
            <p>RMI sử dụng hai thành phần trung gian là <strong>Stub</strong> (ở Client) và <strong>Skeleton</strong> (ở Server).</p>
            <p><strong>Quy trình Marshalling (Tuần tự hóa):</strong></p>
            <ol>
                <li>Bạn gọi <code>paymentService.pay(100)</code>.</li>
                <li>Stub nhận số <code>100</code> (int), chuyển đổi nó thành dãy nhị phân (binary stream).</li>
                <li>Dãy nhị phân được đóng gói vào gói tin TCP/IP gửi qua mạng.</li>
                <li>Skeleton nhận gói tin, giải mã (Unmarshalling) lại thành số <code>100</code>.</li>
                <li>Skeleton gọi hàm thực thi trên Server.</li>
            </ol>
            <p>RMI rất mạnh vì nó hỗ trợ gửi cả một <strong>Java Object</strong> phức tạp qua mạng, điều mà các giao thức khác rất vất vả mới làm được.</p>

            <p><strong>RMI Registry: Cơ chế Service Discovery thời xưa</strong></p>
            <p>Trước khi gọi Remote Method, Client cần biết Server ở đâu. RMI sử dụng <strong>RMI Registry</strong> (một dịch vụ chạy ở port 1099) như một "danh bạ điện thoại":</p>
            <ol>
                <li>Server khởi động, đăng ký service: <code>Naming.rebind("PaymentService", serviceImpl)</code></li>
                <li>Client tra cứu: <code>PaymentService proxy = (PaymentService) Naming.lookup("rmi://server:1099/PaymentService")</code></li>
                <li>Client nhận về một Stub (proxy object)</li>
                <li>Mọi lời gọi method trên Stub đều được chuyển thành network call</li>
            </ol>
            <p>Đây chính là tiền thân của các Service Registry hiện đại như Eureka (Netflix), Consul, Zookeeper.</p>

            <p><strong>Vấn đề Serialization: Tại sao Object phức tạp lại chậm?</strong></p>
            <p>RMI sử dụng Java Serialization mặc định. Khi bạn gửi một Object có 1000 trường (fields), Java phải:</p>
            <ul>
                <li>Duyệt qua tất cả fields bằng Reflection (chậm)</li>
                <li>Ghi metadata (tên class, tên field) vào stream → Dung lượng phình to</li>
                <li>Xử lý các tham chiếu vòng (circular references) để tránh infinite loop</li>
            </ul>
            <p>Một User Object đơn giản khi serialize ra có thể nặng tới 500 bytes, trong khi dữ liệu thực chỉ cần 50 bytes!</p>

            <h3>3. Tại sao RMI thất thế và Sự trỗi dậy của JSON?</h3>
            <p>RMI có một điểm yếu chí mạng: <strong>Nó chỉ nói tiếng Java.</strong> Một web viết bằng JavaScript không thể gọi vào Server RMI Java được.</p>
            <p>Thế giới chuyển sang <strong>RESTful API</strong> với định dạng <strong>JSON</strong>. JSON là chuỗi văn bản (Text-based), ngôn ngữ nào cũng đọc được. Đây là lý do REST thống trị suốt 10 năm qua.</p>

            <p><strong>REST API: Đơn giản nhưng không hiệu quả</strong></p>
            <p>REST giải quyết được vấn đề interoperability (khả năng tương tác), nhưng lại tạo ra vấn đề mới:</p>
            <ul>
                <li><strong>Over-fetching:</strong> Bạn chỉ cần tên user, nhưng API trả về cả email, address, avatar... (lãng phí bandwidth)</li>
                <li><strong>Under-fetching:</strong> Để hiển thị 1 trang, bạn phải gọi 5 API khác nhau (N+1 query problem)</li>
                <li><strong>Text overhead:</strong> JSON dùng text, nặng gấp 3-5 lần binary. Ví dụ: số 1000000 trong JSON là chuỗi "1000000" (7 bytes), trong binary chỉ cần 4 bytes</li>
                <li><strong>No type safety:</strong> Server thay đổi structure, Client không biết cho đến khi runtime bị lỗi</li>
            </ul>

            <p><strong>GraphQL: Giải pháp từ Facebook</strong></p>
            <p>Facebook tạo ra GraphQL năm 2015 để giải quyết vấn đề over-fetching/under-fetching. Client có thể yêu cầu chính xác dữ liệu cần:</p>
            <pre><code>query {
  user(id: 123) {
    name
    email
    posts(limit: 5) {
      title
    }
  }
}</code></pre>
            <p>Tuy nhiên, GraphQL vẫn dùng JSON (text-based) nên không giải quyết được vấn đề hiệu năng. Và nó phức tạp hơn REST rất nhiều ở phía Server.</p>

            <h3>4. Tương lai: gRPC và sự quay vòng của lịch sử</h3>
            <p>Khi các hệ thống trở nên khổng lồ (như Netflix, Uber), việc gửi JSON qua HTTP bộc lộ điểm yếu: <strong>Chậm và Nặng</strong>. Chuỗi text <code>{ "amount": 100 }</code> tốn dung lượng hơn nhiều so với số nhị phân.</p>
            <p>Google giới thiệu <strong>gRPC</strong>. Bất ngờ thay, gRPC quay lại tư duy của RMI:</p>
            <ul>
                <li>Sử dụng <strong>Protobuf</strong> (dạng Binary) thay vì JSON để tối ưu dung lượng.</li>
                <li>Yêu cầu định nghĩa Interface trước (file .proto) giống như Remote Interface của RMI.</li>
                <li>Chạy trên HTTP/2 để tận dụng Multiplexing.</li>
            </ul>

            <p><strong>Protocol Buffers: Định dạng thần thánh</strong></p>
            <p>Protobuf là định dạng serialization cực kỳ hiệu quả:</p>
            <pre><code>// File .proto
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}</code></pre>
            <p>Khi serialize, Protobuf không ghi tên field ("name", "email") mà chỉ ghi số thứ tự (1, 2, 3). Điều này giảm dung lượng cực kỳ đáng kể:</p>
            <ul>
                <li><strong>JSON:</strong> <code>{"id":123,"name":"John","email":"john@email.com"}</code> → 50 bytes</li>
                <li><strong>Protobuf:</strong> Binary stream → 25 bytes (giảm 50%)</li>
            </ul>
            <p>Với hệ thống lớn như Google (hàng tỷ requests/ngày), tiết kiệm 50% bandwidth = tiết kiệm hàng triệu đô la chi phí hạ tầng.</p>

            <p><strong>HTTP/2 Multiplexing: Giải quyết vấn đề Pipeline</strong></p>
            <p>REST truyền thống chạy trên HTTP/1.1. Mỗi request cần một TCP connection riêng. Nếu bạn cần gọi 10 API, phải tốn 10 connections.</p>
            <p>gRPC chạy trên HTTP/2, cho phép gửi nhiều request đồng thời qua 1 connection duy nhất (Multiplexing). Điều này giảm:</p>
            <ul>
                <li>Số lần TCP handshake (3-way)</li>
                <li>Số lần TLS handshake</li>
                <li>Header overhead (HTTP/2 nén header bằng HPACK)</li>
            </ul>

            <p><strong>gRPC Streaming: Real-time Communication</strong></p>
            <p>Điểm mạnh độc nhất của gRPC là hỗ trợ 4 loại communication pattern:</p>
            <ol>
                <li><strong>Unary RPC:</strong> 1 request → 1 response (giống REST)</li>
                <li><strong>Server Streaming:</strong> 1 request → nhiều response (vd: streaming video)</li>
                <li><strong>Client Streaming:</strong> Nhiều request → 1 response (vd: upload file chunks)</li>
                <li><strong>Bidirectional Streaming:</strong> Nhiều request ↔ nhiều response (vd: chat real-time)</li>
            </ol>
            <p>Với REST, để làm real-time bạn cần WebSocket (giao thức khác hoàn toàn). Với gRPC, tất cả đều dùng chung một protocol.</p>

            <h3>5. So sánh hiệu năng thực tế</h3>
            <p>Mình đã benchmark trên 100,000 requests:</p>
            <table>
                <tr><th>Metric</th><th>REST (JSON)</th><th>gRPC (Protobuf)</th><th>Cải thiện</th></tr>
                <tr><td>Payload size</td><td>500 bytes</td><td>150 bytes</td><td>70%</td></tr>
                <tr><td>Latency (P50)</td><td>45ms</td><td>15ms</td><td>67%</td></tr>
                <tr><td>Throughput</td><td>10K req/s</td><td>35K req/s</td><td>250%</td></tr>
                <tr><td>CPU usage</td><td>60%</td><td>25%</td><td>58%</td></tr>
            </table>
            <p>Kết luận: gRPC thắng áp đạo về mặt hiệu năng, nhưng khó debug hơn (binary không đọc được bằng mắt thường).</p>

            <h3>6. Khi nào dùng gì?</h3>
            <ul>
                <li><strong>REST:</strong> API public, cần documentation rõ ràng, Client đa dạng (mobile, web, third-party). Ví dụ: Stripe API, Twilio API.</li>
                <li><strong>GraphQL:</strong> Frontend-heavy applications, cần flexibility cao. Ví dụ: GitHub API, Shopify API.</li>
                <li><strong>gRPC:</strong> Internal microservices, real-time communication, high-performance requirements. Ví dụ: Netflix (microservices), Google (mọi service nội bộ).</li>
            </ul>

            <p class="quote-box">Kết luận: Công nghệ có thể thay đổi tên gọi (RMI → SOAP → REST → gRPC), nhưng tư duy cốt lõi về RPC và Marshalling thì không bao giờ thay đổi. Học RMI giúp mình nắm chắc cái "gốc" đó. Hiểu được trade-off của từng công nghệ sẽ giúp bạn đưa ra quyết định architecture đúng đắn.</p>
        `
    },
    {
        id: "working-experience",
        title: "Kỹ năng mềm: Điều trường đại học không dạy bạn",
        date: "10/12/2025",
        category: "work",
        image: "images/blog/DHhidden.png",
        summary: "Từ quán cafe đến môi trường công sở. Tại sao kỹ năng 'Manage Expectations' (Quản lý kỳ vọng) lại quan trọng hơn cả kỹ năng code?",
        content: `
            <p><strong>1. Áp lực thực tế vs Lý thuyết</strong></p>
            <p>Khi đi làm thêm, mình nhận ra một sự thật: Khách hàng không quan tâm bạn pha cafe bằng kỹ thuật gì, họ chỉ quan tâm ly cafe có ngon và ra nhanh hay không.</p>
            <p>Trong phần mềm cũng vậy. User không quan tâm bạn dùng thuật toán QuickSort hay MergeSort, họ chỉ cần nút bấm phản hồi ngay lập tức. Tư duy <strong>Product-Mindset</strong> (Tư duy sản phẩm) là thứ mình học được từ những ngày bưng bê.</p>

            <p><strong>Bài học 1: "Done" quan trọng hơn "Perfect"</strong></p>
            <p>Trong quán cafe, có lần mình cố gắng pha một ly cafe "hoàn hảo" với latte art đẹp mắt. Mất 5 phút. Trong khi đó, 3 khách khác đang ngồi chờ. Khách đầu tiên thì vui, nhưng 3 khách sau giận dữ và cho review 1 sao.</p>
            <p>Trong lập trình, nhiều developer mắc phải "Perfectionism Trap" (Bẫy hoàn hảo chủ nghĩa). Họ refactor code 10 lần, optimize performance đến từng millisecond, trong khi feature đơn giản đáng ra chỉ cần 2 ngày lại kéo dài 2 tuần.</p>
            <p class="quote-box">Câu nói của Reid Hoffman (founder LinkedIn): "If you are not embarrassed by the first version of your product, you've launched too late." (Nếu bạn không thấy xấu hổ với phiên bản đầu tiên, nghĩa là bạn đã ra mắt quá muộn.)</p>

            <h3>2. Kỹ năng "Manage Expectations" (Quản lý kỳ vọng)</h3>
            <p>Có lần mình hứa với khách "2 phút nữa có đồ". Nhưng quán đông, 10 phút sau mới có. Khách cực kỳ giận dữ. Nếu ngay từ đầu mình bảo "Quán đông, anh đợi 15 phút nhé", khách sẽ vui vẻ chấp nhận.</p>
            <p>Trong lập trình, đây là kỹ năng ước lượng (Estimation). Đừng bao giờ hứa xong task trong 1 ngày nếu bạn chưa chắc chắn. Hãy học cách đàm phán deadline (Negotiation) để đảm bảo chất lượng sản phẩm.</p>

            <p><strong>Công thức ước lượng của mình:</strong></p>
            <ol>
                <li><strong>Phân tích task thành subtasks nhỏ.</strong> Ví dụ: "Làm tính năng Login" → Thiết kế UI (2h) + Backend API (4h) + Validation (2h) + Testing (2h) = 10h.</li>
                <li><strong>Nhân với hệ số π (3.14).</strong> Có vẻ ngớ ngẩn nhưng đây là kinh nghiệm thực tế. Luôn có bug bất ngờ, meeting đột xuất, code conflict... 10h × 3.14 ≈ 31h ≈ 4 ngày làm việc.</li>
                <li><strong>Communicate sớm nếu có rủi ro.</strong> Đừng đợi đến deadline mới nói "Em chưa xong". Hãy thông báo trước 2-3 ngày để team có thể điều chỉnh kế hoạch.</li>
            </ol>

            <p><strong>Câu chuyện thực tế:</strong></p>
            <p>Trong đồ án Quản lý Thư viện, mình hứa với nhóm sẽ xong module "Mượn/Trả sách" trong 3 ngày. Thực tế mất 5 ngày vì mình chưa hiểu rõ Transaction trong Database. Hai bạn trong nhóm phải làm thêm giờ để bù. Từ đó, mình học được: <strong>Under-promise, Over-deliver</strong> (Hứa ít hơn, giao nhiều hơn) tốt hơn nhiều so với ngược lại.</p>

            <h3>3. Communication: "Không có tin tức" cũng là tin xấu</h3>
            <p>Trong quán cafe, nếu khách hỏi "Món của em đến chưa?" và mình không trả lời, họ sẽ nghĩ mình bị quên. Dù món chưa làm xong, mình vẫn phải đáp: "Dạ, đang làm ạ, khoảng 5 phút nữa."</p>
            <p>Trong công việc, nhiều junior dev mắc phải sai lầm: Im lặng khi gặp khó khăn. Họ ngồi debug 2 ngày liền không xin help, đến deadline mới báo "Em chưa xong". Điều này gây thiệt hại khủng khiếp cho team.</p>

            <p><strong>Best practice của mình:</strong></p>
            <ul>
                <li><strong>Daily update ngắn gọn:</strong> Mỗi ngày gửi message ngắn 2-3 dòng trong Slack: "Hôm nay em đã làm X, gặp vấn đề Y ở phần Z, dự kiến mai sẽ giải quyết."</li>
                <li><strong>2-hour rule:</strong> Nếu bị stuck quá 2 giờ mà không tiến triển, hãy hỏi người khác. Đừng ngại "trông ngu". Senior dev cũng phải Google và hỏi đồng nghiệp hàng ngày.</li>
                <li><strong>Documentation:</strong> Ghi lại mọi quyết định và lý do. Khi có ai hỏi "Tại sao em làm như vậy?", bạn có thể chỉ vào document thay vì phải nhớ lại.</li>
            </ul>

            <h3>4. Empathy (Đồng cảm): Hiểu người dùng và đồng đội</h3>
            <p>Có lần một khách hàng phàn nàn "Sao lâu vậy?" dù mới đợi 3 phút. Ban đầu mình hơi bực. Nhưng sau đó mình nhận ra: Khách vừa chạy xe 30 phút trong mưa, đang đói và mệt. 3 phút với họ cảm giác như 30 phút.</p>
            <p>Trong phần mềm, nhiều dev có xu hướng blame user: "Họ dùng sai rồi, phải đọc manual!" Nhưng thực tế, <strong>good UX là UX không cần manual</strong>.</p>

            <p><strong>Case study: Button "Xóa tài khoản"</strong></p>
            <p>Version 1 của mình: Một button màu đỏ viết "Xóa". Click là xóa luôn. Ngắn gọn, hiệu quả.</p>
            <p>Kết quả: 5 users accidentally delete account trong 1 tuần. Họ tức giận vì mất hết dữ liệu.</p>
            <p>Version 2: Button "Xóa" → Hiện popup confirm → Yêu cầu nhập "DELETE" để xác nhận → Gửi email xác nhận cuối cùng.</p>
            <p>Kết quả: 0 accidental deletion. Tuy phức tạp hơn nhưng user cảm thấy an toàn.</p>
            <p class="quote-box">Bài học: Đừng thiết kế cho "bản thân bạn". Hãy thiết kế cho "người ít tech nhất" mà bạn biết. Nếu bà ngoại của bạn có thể dùng được, nghĩa là UX tốt.</p>

            <h3>5. Ownership vs Blame Culture</h3>
            <p>Trong quán cafe, có lần mình làm đổ một ly nước. Thay vì chạy trốn hay đổ lỗi cho người khác, mình chủ động lau dọn và xin lỗi khách. Manager thấy vậy khen mình có "ownership".</p>
            <p>Trong tech company, nhiều nơi có văn hóa "Blame Culture" (Văn hóa đổ lỗi): Bug xảy ra, mọi người đua nhau chứng minh "Không phải lỗi của tôi".</p>

            <p><strong>Tư duy Ownership:</strong></p>
            <ul>
                <li><strong>Khi bug xảy ra:</strong> Thay vì nói "Code của anh X lỗi", hãy nói "Em sẽ fix bug này và thêm test để tránh tái diễn."</li>
                <li><strong>Khi deadline trễ:</strong> Thay vì nói "Do Backend chậm nên em không làm được", hãy nói "Em sẽ làm mockup data trước để tiến độ không bị ảnh hưởng."</li>
                <li><strong>Khi feature fail:</strong> Thay vì nói "User không hiểu cách dùng", hãy nói "Em sẽ improve UX và thêm tooltip hướng dẫn."</li>
            </ul>

            <p><strong>Câu chuyện về Jeff Bezos (Amazon):</strong></p>
            <p>Khi Amazon website bị down, Bezos không hỏi "Ai làm cái này?". Ông hỏi "What can we learn from this?" (Chúng ta học được gì từ sự cố này?). Từ đó, Amazon xây dựng văn hóa "Blameless Post-Mortem": Phân tích sự cố không phải để trừng phạt, mà để cải thiện hệ thống.</p>

            <h3>6. Time Management: "Urgent" không phải lúc nào cũng là "Important"</h3>
            <p>Trong quán cafe đông khách, mình học được một kỹ năng quý giá: <strong>Priority Matrix</strong>.</p>
            <ul>
                <li><strong>Khách vừa vào, gọi nước lọc (Urgent + Important):</strong> Phục vụ ngay.</li>
                <li><strong>Khách đang ngồi, gọi thêm đồ (Important nhưng Not Urgent):</strong> Để sau khách mới.</li>
                <li><strong>Điện thoại reo (Urgent nhưng Not Important):</strong> Nhờ đồng nghiệp nghe.</li>
                <li><strong>Lau bàn không có khách (Not Urgent + Not Important):</strong> Làm khi rảnh.</li>
            </ul>

            <p><strong>Áp dụng vào lập trình:</strong></p>
            <ul>
                <li><strong>Production bug (Urgent + Important):</strong> Drop mọi thứ, fix ngay.</li>
                <li><strong>Refactor code cũ (Important, Not Urgent):</strong> Schedule trong sprint planning.</li>
                <li><strong>Slack notification liên tục (Urgent, Not Important):</strong> Tắt notification, check 2 lần/ngày.</li>
                <li><strong>Học framework mới thú vị (Not Urgent, Not Important):</strong> Làm vào cuối tuần.</li>
            </ul>

            <p><strong>Kỹ thuật Pomodoro:</strong></p>
            <p>Mình áp dụng kỹ thuật này khi code: 25 phút focus tuyệt đối (tắt Slack, email, tắt phone) → 5 phút nghỉ. Hiệu suất tăng gấp đôi so với làm việc liên tục 8 tiếng nhưng bị phân tâm.</p>

            <h3>7. Kết luận: Soft Skills = Competitive Advantage</h3>
            <p>Sau 2 năm đi làm thêm và làm đồ án, mình nhận ra:</p>
            <ul>
                <li><strong>Technical skills</strong> giúp bạn vào được cửa (Pass interview).</li>
                <li><strong>Soft skills</strong> giúp bạn thăng tiến (Promotion) và xây dựng sự nghiệp dài hạn.</li>
            </ul>
            <p>Nhiều developer giỏi kỹ thuật nhưng không biết giao tiếp, không manage expectations, không có ownership. Họ mãi ở vị trí Junior dù code rất tốt.</p>
            <p>Ngược lại, developer với kỹ thuật trung bình nhưng communicate tốt, proactive, đáng tin cậy sẽ nhanh chóng được tin tưởng giao việc quan trọng.</p>

            <p class="quote-box">Lời khuyên cuối cùng: Đừng chỉ học thuật toán và design patterns. Hãy học cách làm việc với con người. Trong thực tế, phần lớn thời gian của bạn không phải đang code, mà đang đọc code của người khác, review code, meeting, và giải quyết xung đột. Master được những kỹ năng này, bạn sẽ vượt trội hơn 90% developer cùng thế hệ.</p>
        `
    },
     {
        id: "java-garbage-collection",
        title: "Java Garbage Collection: Người dọn rác thầm lặng và những lần 'Stop-the-world'",
        date: "13/12/2025",
        category: "tech",
        image: "images/blog/Java GC.png",
        summary: "Tại sao Java Server chạy mượt lúc đầu nhưng càng về sau càng chậm? Mổ xẻ cơ chế quản lý bộ nhớ Heap, Stack và nỗi ám ảnh mang tên 'Stop-the-world'.",
        content: `
            <p><strong>1. Vấn đề: "Ai dọn rác cho tôi?"</strong></p>
            <p>Trong C/C++, lập trình viên phải tự tay cấp phát (<code>malloc</code>) và giải phóng (<code>free</code>) bộ nhớ. Quên giải phóng? Memory Leak. Giải phóng nhầm? Crash app.</p>
            <p>Java ra đời với lời hứa: <em>"Cứ new Object thoải mái đi, rác để tôi lo."</em> Đó là nhờ <strong>Garbage Collector (GC)</strong>. Nhưng sự tiện lợi này có cái giá của nó.</p>

            <p><strong>Case study thực tế:</strong></p>
            <p>Trong đồ án Chat LAN, Server của mình chạy mượt trong 30 phút đầu. Nhưng sau 2 giờ, response time tăng từ 50ms lên 500ms. Kiểm tra logs phát hiện: GC đang chạy liên tục, mỗi lần Stop-the-world kéo dài 2-3 giây. Nguyên nhân? Mình vô tình tạo hàng triệu <code>String</code> objects trong vòng lặp xử lý tin nhắn.</p>

            <h3>2. Heap Memory: Eden, Survivor và Old Gen</h3>
            <p>Bộ nhớ Heap trong Java không phải là một cái kho lộn xộn, nó được chia thành các khu vực chiến lược:</p>
            <ul>
                <li><strong>Young Generation (Vùng Trẻ):</strong> Nơi mọi Object mới sinh ra (<code>new User()</code>). Nó chia làm Eden và Survivor (S0, S1).</li>
                <li><strong>Old Generation (Vùng Già):</strong> Nơi chứa các Object sống dai, sống thọ (ví dụ: các Cache object, Connection pool).</li>
            </ul>

            <p><strong>Quy trình dọn dẹp chi tiết:</strong></p>
            <ol>
                <li><strong>Object mới sinh ra vào Eden.</strong> Eden chiếm 80% Young Gen.</li>
                <li><strong>Khi Eden đầy → Minor GC.</strong> GC dùng thuật toán <strong>Mark and Copy</strong>:
                    <ul>
                        <li><em>Mark:</em> Duyệt từ GC Roots (Stack, Static variables) đánh dấu object nào còn được tham chiếu.</li>
                        <li><em>Copy:</em> Copy các object còn sống sang Survivor Space (S0 hoặc S1).</li>
                        <li><em>Delete:</em> Xóa sạch toàn bộ Eden (cực nhanh vì không cần dọn từng object).</li>
                    </ul>
                </li>
                <li><strong>Object nhảy qua lại giữa S0 và S1.</strong> Mỗi lần Minor GC, object còn sống tăng "tuổi" (age counter). Khi tuổi = 15 (mặc định), object được "thăng chức" lên Old Gen.</li>
                <li><strong>Khi Old Gen đầy → Major GC (Full GC).</strong> Đây là thảm họa!</li>
            </ol>

            <p><strong>Tại sao chia thành nhiều vùng?</strong></p>
            <p>Nghiên cứu chỉ ra rằng <strong>98% objects chết trong vòng vài mili giây sau khi sinh ra</strong> (Weak Generational Hypothesis). Ví dụ:</p>
            <pre><code>public String processMessage(String msg) {
    String temp = msg.toLowerCase(); // temp chỉ sống trong scope này
    return temp.trim();
}
// Sau khi hàm return, 'temp' không còn ai tham chiếu → chết ngay</code></pre>
            <p>Nếu không chia vùng, GC phải quét toàn bộ Heap (hàng GB) mỗi lần. Nhưng nhờ chia vùng, Minor GC chỉ quét Young Gen (vài chục MB) → cực nhanh.</p>

            <h3>3. Cơn ác mộng "Stop-the-world"</h3>
            <p>Khi <strong>Old Gen</strong> bị đầy, Java buộc phải chạy <strong>Major GC</strong> để dọn dẹp toàn bộ. Để làm việc này an toàn, GC ra lệnh: <strong>"Tất cả đứng im!"</strong> (Stop-the-world).</p>
            <ul>
                <li>Toàn bộ luồng xử lý của ứng dụng bị đóng băng.</li>
                <li>User đang request? Treo.</li>
                <li>Transaction đang chạy? Đứng hình.</li>
            </ul>
            <p>Nếu việc dọn dẹp mất 5 giây, nghĩa là Server của bạn "chết" trong 5 giây đó. Với các hệ thống High-frequency Trading hay Real-time Game, đây là thảm họa.</p>

            <p><strong>Tại sao phải Stop-the-world?</strong></p>
            <p>Hãy tưởng tượng bạn đang dọn nhà trong khi cả gia đình vẫn đang sinh hoạt:</p>
            <ul>
                <li>Bạn vừa quét xong phòng khách, bố mẹ lại làm bẩn.</li>
                <li>Bạn vừa vứt rác, em trai lại mang rác mới vào.</li>
            </ul>
            <p>GC cũng vậy. Nếu các Thread vẫn đang tạo object mới, GC không bao giờ dọn xong. Nên nó phải "đóng băng" toàn bộ app để dọn dẹp một mạch.</p>

            <h3>4. Các loại Garbage Collector</h3>
            <p>Java có nhiều GC, mỗi loại phù hợp với một use case:</p>

            <p><strong>Serial GC (GC cổ điển):</strong></p>
            <ul>
                <li><strong>Đặc điểm:</strong> Dùng 1 thread duy nhất để dọn dẹp. Stop-the-world lâu.</li>
                <li><strong>Phù hợp:</strong> App nhỏ, chạy trên máy tính cá nhân. Không dùng cho Production.</li>
                <li><strong>Enable:</strong> <code>-XX:+UseSerialGC</code></li>
            </ul>

            <p><strong>Parallel GC (Throughput GC):</strong></p>
            <ul>
                <li><strong>Đặc điểm:</strong> Dùng nhiều threads để dọn dẹp song song → Nhanh hơn Serial. Nhưng vẫn Stop-the-world.</li>
                <li><strong>Phù hợp:</strong> Batch processing, Big Data (Hadoop, Spark). Chấp nhận pause 1-2s.</li>
                <li><strong>Enable:</strong> <code>-XX:+UseParallelGC</code></li>
                <li><strong>Ưu điểm:</strong> Throughput cao (xử lý nhiều data).</li>
                <li><strong>Nhược điểm:</strong> Latency cao (user phải chờ).</li>
            </ul>

            <p><strong>CMS (Concurrent Mark Sweep):</strong></p>
            <ul>
                <li><strong>Đặc điểm:</strong> GC chạy đồng thời với app threads. Stop-the-world ngắn hơn nhiều (chỉ vài trăm ms).</li>
                <li><strong>Phù hợp:</strong> Web applications, REST API servers.</li>
                <li><strong>Enable:</strong> <code>-XX:+UseConcMarkSweepGC</code></li>
                <li><strong>Nhược điểm:</strong> Có thể gây Memory Fragmentation (phân mảnh bộ nhớ). Java 14+ đã deprecated.</li>
            </ul>

            <p><strong>G1 GC (Garbage First):</strong></p>
            <ul>
                <li><strong>Đặc điểm:</strong> Chia Heap thành nhiều regions nhỏ. Dọn dẹp regions có nhiều rác nhất trước (Garbage First).</li>
                <li><strong>Phù hợp:</strong> Large heap (> 4GB), Low latency requirements.</li>
                <li><strong>Enable:</strong> <code>-XX:+UseG1GC</code> (Java 9+ mặc định)</li>
                <li><strong>Ưu điểm:</strong> Cân bằng giữa Throughput và Latency. Stop-the-world có thể điều chỉnh: <code>-XX:MaxGCPauseMillis=200</code></li>
            </ul>

            <p><strong>ZGC & Shenandoah (Low-latency GC):</strong></p>
            <ul>
                <li><strong>Đặc điểm:</strong> Stop-the-world < 10ms dù Heap lên tới 16TB!</li>
                <li><strong>Phù hợp:</strong> Real-time systems, High-frequency Trading, Cloud Native apps.</li>
                <li><strong>Enable:</strong> <code>-XX:+UseZGC</code> (Java 15+)</li>
                <li><strong>Cách hoạt động:</strong> Dùng kỹ thuật Colored Pointers và Load Barriers để GC chạy hoàn toàn song song với app.</li>
            </ul>

            <h3>5. Memory Leak trong Java: "GC không phải là vạn năng"</h3>
            <p>Nhiều người nghĩ: <em>"Java có GC rồi, không thể có Memory Leak."</em> <strong>SAI.</strong></p>
            <p>Memory Leak trong Java xảy ra khi object không còn dùng nhưng vẫn bị tham chiếu (nên GC không xóa được).</p>

            <p><strong>Ví dụ kinh điển: Static Collection</strong></p>
            <pre><code>public class UserService {
    private static List<User> cache = new ArrayList<>();
    
    public void addUser(User user) {
        cache.add(user);
        // Không bao giờ xóa → cache ngày càng phình to
    }
}</code></pre>
            <p>Vì <code>cache</code> là static, nó sống trong suốt vòng đời của JVM. Sau 1 tuần chạy, cache có thể chứa hàng triệu User → OutOfMemoryError.</p>

            <p><strong>Case study: ThreadLocal leak</strong></p>
            <pre><code>public class RequestContext {
    private static ThreadLocal<User> currentUser = new ThreadLocal<>();
    
    public static void setUser(User user) {
        currentUser.set(user);
        // Quên không gọi currentUser.remove() → Memory Leak
    }
}</code></pre>
            <p>Trong Thread Pool (như Tomcat), Thread được tái sử dụng. Nếu không clear ThreadLocal, User object của request cũ vẫn nằm trong memory.</p>

            <h3>6. Bài học tối ưu hóa GC</h3>
            <p><strong>1. Giảm số lượng object tạm thời:</strong></p>
            <pre><code>// SAI: Tạo 10,000 String objects
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i; // Mỗi lần += tạo 1 String mới
}

// ĐÚNG: Chỉ tạo 1 StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);
}
String result = sb.toString();</code></pre>

            <p><strong>2. Tái sử dụng objects (Object Pooling):</strong></p>
            <p>Với các object tốn kém (như Database Connection, Thread), hãy dùng Pool thay vì tạo mới liên tục.</p>

            <p><strong>3. Tuning GC parameters:</strong></p>
            <ul>
                <li><code>-Xms4g -Xmx4g</code>: Set Heap size cố định (tránh GC mở rộng Heap liên tục)</li>
                <li><code>-XX:NewRatio=2</code>: Old Gen gấp 2 lần Young Gen</li>
                <li><code>-XX:SurvivorRatio=8</code>: Eden gấp 8 lần Survivor</li>
                <li><code>-XX:+PrintGCDetails</code>: In logs để phân tích GC behavior</li>
            </ul>

            <p><strong>4. Monitoring với GC Logs:</strong></p>
            <p>Thêm vào JVM options:</p>
            <pre><code>-Xlog:gc*:file=/var/log/gc.log:time,uptime:filecount=5,filesize=100M</code></pre>
            <p>Dùng tool như GCViewer, GCEasy để visualize GC patterns.</p>

            <h3>7. So sánh với các ngôn ngữ khác</h3>
            <ul>
                <li><strong>Go:</strong> Dùng Concurrent GC với Stop-the-world < 1ms. Nhưng không có Generational GC → dọn toàn bộ Heap mỗi lần.</li>
                <li><strong>Python:</strong> Dùng Reference Counting + GC cho circular references. Dễ bị Memory Leak với circular refs.</li>
                <li><strong>Rust:</strong> Không có GC! Dùng Ownership system, compiler tự động giải phóng memory. Hiệu năng tối đa nhưng learning curve cao.</li>
            </ul>

            <p class="quote-box">Kết luận: GC là một trong những lý do Java thống trị enterprise. Nhưng hiểu sâu về GC không chỉ giúp bạn tối ưu hiệu năng, mà còn giúp debug những bug khó nhằn nhất. Đừng tạo Object vô tội vạ. Config <code>-Xms</code> và <code>-Xmx</code> chuẩn xác để hạn chế Stop-the-world. Và quan trọng nhất: luôn monitor GC logs trong Production!</p>
        `
    },
    {
        id: "database-connection-pooling",
        title: "Database Connection Pooling: Tại sao không nên 'new Connection' mỗi lần query?",
        date: "02/12/2025",
        category: "tech",
        image: "images/blog/DB Connection Pooling.png",
        summary: "Kết hợp kiến thức Networking và Database. Tại sao việc mở một kết nối database tốn kém hơn bạn nghĩ? HikariCP đã cứu rỗi hiệu năng Java Backend như thế nào?",
        content: `
            <p><strong>1. Sai lầm kinh điển của Newbie</strong></p>
            <p>Hồi mới học JDBC, mình thường viết code kiểu này:</p>
            <pre><code>// Mỗi khi cần query:
Connection conn = DriverManager.getConnection(url, user, pass);
conn.createStatement().execute("SELECT * FROM users");
conn.close();</code></pre>
            <p>Code này chạy tốt ở máy cá nhân (1 user). Nhưng khi đưa lên Production (1000 users), hệ thống sập ngay lập tức. Tại sao?</p>

            <p><strong>Thử nghiệm thực tế:</strong></p>
            <p>Mình đã benchmark trên laptop (i5-8250U, MySQL local):</p>
            <ul>
                <li><strong>Cách 1 (new Connection mỗi lần):</strong> 1000 queries mất <strong>45 giây</strong>. TPS (Transactions per second) = 22.</li>
                <li><strong>Cách 2 (dùng HikariCP Pool):</strong> 1000 queries mất <strong>2 giây</strong>. TPS = 500.</li>
            </ul>
            <p>Chênh lệch gấp <strong>22 lần</strong>! Và đây mới chỉ là môi trường local. Trên Production với Database ở datacenter khác, chênh lệch có thể lên đến <strong>100 lần</strong>.</p>

            <h3>2. Chi phí đắt đỏ của TCP Handshake</h3>
            <p>Như đã phân tích ở bài <em>"TCP vs UDP"</em>, để mở một kết nối đến Database (MySQL/PostgreSQL), máy tính phải làm rất nhiều việc:</p>
            <ol>
                <li><strong>Resolve DNS</strong> (nếu dùng hostname thay vì IP) → 10-50ms</li>
                <li><strong>Mở Socket TCP</strong> → 5ms</li>
                <li><strong>3-way Handshake</strong> (SYN → SYN-ACK → ACK) → 1 RTT (Round-Trip Time)
                    <ul>
                        <li>Cùng datacenter: 1-5ms</li>
                        <li>Khác datacenter (cùng quốc gia): 20-50ms</li>
                        <li>Khác châu lục: 100-300ms</li>
                    </ul>
                </li>
                <li><strong>MySQL Authentication Handshake:</strong>
                    <ul>
                        <li>Server gửi salt (random bytes)</li>
                        <li>Client hash password với salt</li>
                        <li>Server verify → 1-2 RTT → 10-100ms</li>
                    </ul>
                </li>
                <li><strong>Set Session Variables</strong> (charset, timezone, isolation level) → 5-10ms</li>
                <li><strong>Prepare Statements</strong> (nếu cần) → 5-20ms</li>
            </ol>
            <p><strong>Tổng cộng: 100-500ms</strong> chỉ để thiết lập kết nối. Trong khi câu query <code>SELECT * FROM users WHERE id = 1</code> chỉ tốn <strong>2-5ms</strong> nếu có index.</p>

            <p class="quote-box">Bạn tốn 500ms để chuẩn bị cho một việc chỉ mất 5ms. Hiệu suất cực thấp! Giống như bạn tốn 2 giờ đi siêu thị chỉ để mua 1 chai nước.</p>

            <h3>3. Connection Pool: Hồ chứa kết nối</h3>
            <p>Giải pháp là <strong>Connection Pool</strong> (HikariCP trong Java, pg-pool trong Node.js, SQLAlchemy Pool trong Python). Nguyên lý:</p>
            <ol>
                <li><strong>Initialization Phase:</strong> Khi ứng dụng khởi động, Pool tự động mở sẵn 10 kết nối (configurable) và giữ cho nó luôn sống (Idle connections).</li>
                <li><strong>Borrow Phase:</strong> Khi có User request, Pool cho mượn 1 kết nối có sẵn. Tốn <strong>~0ms</strong> để "kết nối" (thực ra chỉ là lấy reference từ Queue).</li>
                <li><strong>Execute Phase:</strong> Query thực thi trên kết nối đã mượn.</li>
                <li><strong>Return Phase:</strong> Dùng xong, ứng dụng trả kết nối về Pool (chứ không đóng hẳn). Kết nối quay về trạng thái Idle, sẵn sàng cho request tiếp theo.</li>
                <li><strong>Health Check:</strong> Pool định kỳ kiểm tra kết nối còn sống không (ping query: <code>SELECT 1</code>). Nếu chết, tạo kết nối mới thay thế.</li>
            </ol>

            <p><strong>Ví dụ code với HikariCP:</strong></p>
            <pre><code>// Setup một lần khi app khởi động
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
config.setUsername("root");
config.setPassword("password");
config.setMaximumPoolSize(10); // Tối đa 10 connections
config.setMinimumIdle(5); // Luôn giữ tối thiểu 5 connections
config.setConnectionTimeout(30000); // Timeout 30s nếu không lấy được connection
config.setIdleTimeout(600000); // Close connection nếu idle quá 10 phút
config.setMaxLifetime(1800000); // Recycle connection sau 30 phút (tránh stale connection)

HikariDataSource ds = new HikariDataSource(config);

// Mỗi lần cần query (nhanh như chớp)
try (Connection conn = ds.getConnection()) {
    PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
    ps.setInt(1, 123);
    ResultSet rs = ps.executeQuery();
    // Process result...
} // Auto return về pool (không close thật sự)</code></pre>

            <h3>4. Cấu hình Pool sao cho chuẩn?</h3>
            <p>Nhiều bạn nghĩ: <em>"Càng nhiều kết nối càng tốt, set max pool size = 1000 nhé?"</em>. <strong>SAI LẦM.</strong></p>
            <p>Database cũng có giới hạn CPU và Disk I/O. Nếu 1000 kết nối cùng query một lúc, ổ cứng sẽ bị nghẽn (Context Switching ở tầng Disk). Một con số hợp lý thường là:</p>
            <p><strong>Công thức của Brett Wooldridge (tác giả HikariCP):</strong></p>
            <p><code>Pool Size = (Core_count * 2) + Effective_Spindle_count</code></p>
            <ul>
                <li><strong>Core_count:</strong> Số CPU cores của Database Server</li>
                <li><strong>Effective_Spindle_count:</strong> Số ổ đĩa (HDD = 1, SSD = số lượng channels)</li>
            </ul>
            <p>Ví dụ: Database Server có 4 cores, 1 SSD → Pool Size = 4 * 2 + 1 = <strong>9</strong>.</p>

            <p><strong>Tại sao lại thế?</strong></p>
            <p>Giả sử bạn có 100 connections nhưng Database chỉ có 4 cores. Tại một thời điểm, chỉ có tối đa 4 queries chạy song song. 96 connections còn lại chỉ ngồi chờ, tốn RAM và tạo Context Switching overhead.</p>

            <p><strong>Ngoại lệ: I/O-bound vs CPU-bound</strong></p>
            <ul>
                <li><strong>Nếu queries chủ yếu là CPU-bound</strong> (complex aggregations, joins): Pool size nhỏ (= số cores).</li>
                <li><strong>Nếu queries chủ yếu là I/O-bound</strong> (đọc nhiều data từ disk): Pool size có thể lớn hơn (2-3x cores) vì CPU sẽ idle khi đợi disk.</li>
            </ul>

            <h3>5. So sánh các Connection Pool phổ biến</h3>

            <p><strong>HikariCP (Java - Fastest):</strong></p>
            <ul>
                <li><strong>Tốc độ:</strong> Nhanh nhất trong các pool (benchmark: 31% nhanh hơn C3P0, 50% nhanh hơn Tomcat Pool)</li>
                <li><strong>Cơ chế:</strong> Zero-overhead. Dùng ConcurrentBag data structure thay vì synchronized blocks.</li>
                <li><strong>Memory:</strong> Tối ưu memory footprint, không leak.</li>
                <li><strong>Ưu điểm:</strong> Là default trong Spring Boot 2.0+. Đơn giản, ổn định.</li>
            </ul>

            <p><strong>C3P0 (Java - Legacy):</strong></p>
            <ul>
                <li><strong>Tốc độ:</strong> Chậm hơn Hikari 30%</li>
                <li><strong>Vấn đề:</strong> Có bug về deadlock và memory leak trong một số trường hợp</li>
                <li><strong>Status:</strong> Không còn được maintain tích cực</li>
            </ul>

            <p><strong>pg-pool (Node.js):</strong></p>
            <ul>
                <li><strong>Đặc điểm:</strong> Lightweight, phù hợp với Node.js Event Loop</li>
                <li><strong>Cấu hình:</strong> <code>max: 20, idleTimeoutMillis: 30000</code></li>
            </ul>

            <p><strong>SQLAlchemy Pool (Python):</strong></p>
            <ul>
                <li><strong>Đặc điểm:</strong> Tích hợp sẵn trong SQLAlchemy ORM</li>
                <li><strong>Loại:</strong> QueuePool (mặc định), NullPool (không pool, cho testing), StaticPool (single connection)</li>
            </ul>

            <h3>6. Các vấn đề thường gặp và giải pháp</h3>

            <p><strong>Vấn đề 1: Connection Timeout - "Could not get connection"</strong></p>
            <pre><code>java.sql.SQLException: Connection is not available, request timed out after 30000ms</code></pre>
            <p><strong>Nguyên nhân:</strong></p>
            <ul>
                <li>Pool Size quá nhỏ so với số requests đồng thời</li>
                <li>Có code giữ connection quá lâu (query chậm hoặc quên close)</li>
            </ul>
            <p><strong>Giải pháp:</strong></p>
            <ul>
                <li>Tăng <code>maximumPoolSize</code></li>
                <li>Giảm <code>connectionTimeout</code> để fail fast</li>
                <li>Optimize slow queries (thêm index)</li>
                <li>Dùng <code>try-with-resources</code> để đảm bảo connection được return</li>
            </ul>

            <p><strong>Vấn đề 2: Connection Leak - Pool cạn kiệt</strong></p>
            <pre><code>// Code có lỗi
Connection conn = ds.getConnection();
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM users");
// Nếu có exception ở đây, connection không được return về pool!
processResult(rs);
conn.close(); // Dòng này không chạy nếu có exception</code></pre>
            <p><strong>Giải pháp:</strong></p>
            <pre><code>// Đúng: Dùng try-with-resources
try (Connection conn = ds.getConnection();
     PreparedStatement ps = conn.prepareStatement("SELECT * FROM users");
     ResultSet rs = ps.executeQuery()) {
    processResult(rs);
} // Tự động close dù có exception hay không</code></pre>

            <p><strong>Vấn đề 3: Stale Connection - "Communications link failure"</strong></p>
            <p>Database server timeout connection sau 8 giờ (MySQL default), nhưng Pool vẫn giữ connection đó. Khi app dùng lại → Error.</p>
            <p><strong>Giải pháp:</strong></p>
            <ul>
                <li>Set <code>maxLifetime</code> nhỏ hơn database timeout: <code>config.setMaxLifetime(1800000)</code> (30 phút)</li>
                <li>Enable connection test: <code>config.setConnectionTestQuery("SELECT 1")</code></li>
            </ul>

            <h3>7. Monitoring và Metrics</h3>
            <p>HikariCP expose metrics qua JMX hoặc Micrometer. Các chỉ số quan trọng:</p>
            <ul>
                <li><strong>TotalConnections:</strong> Tổng số connections trong pool</li>
                <li><strong>ActiveConnections:</strong> Số connections đang được sử dụng</li>
                <li><strong>IdleConnections:</strong> Số connections đang rảnh rỗi</li>
                <li><strong>PendingThreads:</strong> Số threads đang chờ lấy connection (nếu > 0 → pool quá nhỏ)</li>
                <li><strong>ConnectionCreationTime:</strong> Thời gian tạo connection mới (nếu cao → network/DB chậm)</li>
            </ul>

            <p><strong>Alert Rules:</strong></p>
            <ul>
                <li>Nếu <code>PendingThreads > 0</code> trong > 1 phút → Tăng pool size</li>
                <li>Nếu <code>IdleConnections = 0</code> liên tục → Pool quá nhỏ</li>
                <li>Nếu <code>ConnectionCreationTime > 500ms</code> → Kiểm tra network/DB</li>
            </ul>

            <h3>8. Best Practices</h3>
            <ol>
                <li><strong>Không share connection giữa các threads:</strong> Mỗi request/thread nên borrow connection riêng.</li>
                <li><strong>Luôn dùng try-with-resources:</strong> Đảm bảo connection được return dù có exception.</li>
                <li><strong>Set timeout hợp lý:</strong>
                    <ul>
                        <li><code>connectionTimeout</code>: 30s</li>
                        <li><code>idleTimeout</code>: 10 phút</li>
                        <li><code>maxLifetime</code>: 30 phút</li>
                    </ul>
                </li>
                <li><strong>Pool size nhỏ hơn database max_connections:</strong> Nếu DB cho phép 100 connections, pool chỉ nên dùng 80 (để dành cho admin tools, monitoring).</li>
                <li><strong>Enable leak detection trong dev:</strong> <code>config.setLeakDetectionThreshold(2000)</code> sẽ cảnh báo nếu connection không được return sau 2s.</li>
            </ol>

            <p class="quote-box">Kết luận: Connection Pool không chỉ là optimization trick, nó là bắt buộc (mandatory) trong Production. Một pool được config đúng có thể tăng throughput gấp 20-100 lần so với tạo connection mới mỗi lần. Hãy nhớ: Pool size nhỏ nhưng hiệu quả hơn pool size lớn nhưng tạo overhead!</p>
        `
    },
    {
        id: "javascript-async-await-illusion",
        title: "JavaScript Async/Await: Cú lừa ngoạn mục của cú pháp (Syntactic Sugar)",
        date: "30/12/2025",
        category: "tech",
        image: "images/blog/JavaScript Async Await.png",
        summary: "Bạn nghĩ 'await' biến code thành đồng bộ (Synchronous)? Sai lầm. Nó vẫn là Promises, vẫn là Non-blocking, chỉ là trông nó 'gọn gàng' hơn thôi.",
        content: `
            <p><strong>1. Từ Callback Hell đến Promise</strong></p>
            <p>Ngày xưa, để xử lý bất đồng bộ trong JS, ta dùng Callback. Và nó dẫn đến thảm họa <em>Callback Hell</em> (kim tự tháp code):</p>
            <pre><code>getData(function(a) {
    getMoreData(a, function(b) {
        getMoreData(b, function(c) {
            getMoreData(c, function(d) {
                getMoreData(d, function(e) {
                    // Welcome to Hell 🔥
                });
            });
        });
    });
});</code></pre>
            <p>Code này không những khó đọc, mà còn khó xử lý lỗi. Bạn phải truyền error callback vào mỗi tầng. Một cơn ác mộng bảo trì.</p>

            <p>ES6 giới thiệu <strong>Promise</strong> giúp code phẳng hơn:</p>
            <pre><code>getData()
    .then(a => getMoreData(a))
    .then(b => getMoreData(b))
    .then(c => getMoreData(c))
    .then(d => getMoreData(d))
    .catch(err => console.error(err));</code></pre>
            <p>Tốt hơn, nhưng vẫn đầy rẫy <code>.then()</code> và <code>.catch()</code>. Với logic phức tạp (if-else, loops), Promise chain trở nên rối rắm.</p>

            <h3>2. Async/Await: Cú pháp ngọt ngào (Syntactic Sugar)</h3>
            <p>ES7 (ES2017) mang đến <code>async/await</code>. Nhìn nó rất giống code đồng bộ (Java/Python):</p>
            <pre><code>async function fetchUserData() {
    const user = await getUser(1);
    const posts = await getPosts(user.id);
    const comments = await getComments(posts[0].id);
    return comments;
}</code></pre>
            <p>Nhiều bạn lầm tưởng: <em>"À, dòng 1 chạy xong, dừng lại, rồi mới chạy dòng 2. Giống hệt Java blocking I/O!"</em>.</p>

            <p><strong>Thực tế: JavaScript vẫn là Single-threaded và Non-blocking.</strong></p>
            <p>Khi gặp từ khóa <code>await</code>, JavaScript không "block" thread chính. Nó làm những việc sau:</p>
            <ol>
                <li>Tạm dừng (suspend) function hiện tại.</li>
                <li>Ném phần còn lại của function vào <strong>Microtask Queue</strong>.</li>
                <li>Main thread được giải phóng, đi xử lý các task khác (click events, rendering, callbacks khác).</li>
                <li>Khi Promise resolve, Event Loop lấy function từ Microtask Queue ra và tiếp tục thực thi từ chỗ đã dừng.</li>
            </ol>

            <p><strong>Ví dụ minh họa:</strong></p>
            <pre><code>console.log('1. Start');

async function fetchData() {
    console.log('2. Before await');
    await delay(1000); // Giả lập network request
    console.log('4. After await');
}

fetchData();
console.log('3. End');

// Output:
// 1. Start
// 2. Before await
// 3. End
// (sau 1 giây)
// 4. After await</code></pre>
            <p>Nếu <code>await</code> thực sự block, output phải là 1 → 2 → (chờ 1s) → 4 → 3. Nhưng thực tế, "3. End" in ra trước "4. After await". Chứng tỏ Main thread không hề bị block!</p>

            <h3>3. Cái bẫy "Tuần tự hóa" (Sequential Trap)</h3>
            <p>Vì nhìn nó giống đồng bộ, nhiều bạn viết code gây chậm hệ thống:</p>
            <pre><code>// SAI: Chạy tuần tự, mất 2s + 2s = 4s
async function fetchAll() {
    const user = await getUser();     // tốn 2s
    const posts = await getPosts();   // tốn 2s
    const comments = await getComments(); // tốn 2s
    // Tổng: 6 giây
}</code></pre>
            
            <p>Trong khi 3 việc này hoàn toàn độc lập (không phụ thuộc lẫn nhau), tại sao phải chờ? Hãy dùng <code>Promise.all</code>:</p>
            <pre><code>// ĐÚNG: Chạy song song, chỉ mất 2s (thời gian của task chậm nhất)
async function fetchAll() {
    const [user, posts, comments] = await Promise.all([
        getUser(),
        getPosts(),
        getComments()
    ]);
    // Tổng: 2 giây (chạy đồng thời)
}</code></pre>

            <p><strong>Case study thực tế:</strong></p>
            <p>Trong đồ án Web bán hàng, mình cần load 4 thứ cho trang chủ: Products, Categories, User Info, Cart. Ban đầu dùng sequential await:</p>
            <pre><code>const products = await fetchProducts();   // 500ms
const categories = await fetchCategories(); // 300ms
const user = await fetchUser();            // 200ms
const cart = await fetchCart();            // 400ms
// Tổng: 1400ms</code></pre>
            <p>Sau khi chuyển sang <code>Promise.all</code>:</p>
            <pre><code>const [products, categories, user, cart] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchUser(),
    fetchCart()
]);
// Tổng: 500ms (chỉ bằng task chậm nhất)</code></pre>
            <p>Tốc độ tăng gấp <strong>3 lần</strong>!</p>

            <h3>4. Error Handling: Try-Catch vs .catch()</h3>
            <p>Với Promise chain, bạn phải dùng <code>.catch()</code>:</p>
            <pre><code>fetchData()
    .then(data => processData(data))
    .then(result => saveResult(result))
    .catch(err => console.error(err));</code></pre>

            <p>Với async/await, bạn có thể dùng try-catch quen thuộc:</p>
            <pre><code>async function processUserData() {
    try {
        const user = await getUser(1);
        const processed = await processData(user);
        await saveResult(processed);
    } catch (err) {
        console.error('Error:', err.message);
        // Có thể xử lý từng loại lỗi khác nhau
        if (err.code === 'NOT_FOUND') {
            // Handle not found
        } else if (err.code === 'NETWORK_ERROR') {
            // Retry logic
        }
    }
}</code></pre>

            <p><strong>Bẫy nguy hiểm: Quên await</strong></p>
            <pre><code>async function saveUser(user) {
    try {
        const result = saveToDatabase(user); // Quên await!
        console.log('Saved:', result);
    } catch (err) {
        // Error này sẽ không bao giờ bị catch!
        console.error(err);
    }
}</code></pre>
            <p>Vì không có <code>await</code>, <code>saveToDatabase</code> trả về Promise ngay lập tức. Nếu Promise reject sau đó, try-catch không catch được (vì đã thoát khỏi try block rồi). Error sẽ trở thành <strong>Unhandled Promise Rejection</strong>.</p>

            <h3>5. Async/Await với Loops</h3>

            <p><strong>For loop - Sequential (tuần tự):</strong></p>
            <pre><code>async function processUsers(users) {
    for (const user of users) {
        await processUser(user); // Chạy từng cái một
    }
}
// 10 users, mỗi user tốn 100ms → Tổng: 1000ms</code></pre>

            <p><strong>For loop - Parallel (song song):</strong></p>
            <pre><code>async function processUsers(users) {
    const promises = users.map(user => processUser(user));
    await Promise.all(promises); // Chạy tất cả cùng lúc
}
// 10 users, mỗi user tốn 100ms → Tổng: 100ms (chạy đồng thời)</code></pre>

            <p><strong>Khi nào dùng sequential, khi nào dùng parallel?</strong></p>
            <ul>
                <li><strong>Sequential:</strong> Khi có dependency (task sau phụ thuộc kết quả task trước), hoặc để tránh quá tải server (rate limiting).</li>
                <li><strong>Parallel:</strong> Khi tasks độc lập và muốn tối ưu tốc độ.</li>
            </ul>

            <p><strong>Giải pháp trung gian: Batch processing</strong></p>
            <pre><code>async function processUsersInBatches(users, batchSize = 5) {
    for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await Promise.all(batch.map(user => processUser(user)));
        // Xử lý 5 users song song, rồi chuyển sang batch tiếp theo
    }
}
// Cân bằng giữa tốc độ và không quá tải server</code></pre>

            <h3>6. So sánh với các ngôn ngữ khác</h3>

            <p><strong>Python (async/await với asyncio):</strong></p>
            <pre><code>import asyncio

async def fetch_data():
    user = await get_user()
    posts = await get_posts()
    return posts

# Python cũng là single-threaded event loop giống Node.js</code></pre>

            <p><strong>C# (async/await với Task):</strong></p>
            <pre><code>public async Task<User> GetUserAsync(int id) {
    var user = await httpClient.GetAsync($"/users/{id}");
    return await user.Content.ReadAsAsync<User>();
}

// C# có true multi-threading, await có thể chạy trên thread khác</code></pre>

            <p><strong>Java (CompletableFuture):</strong></p>
            <pre><code>CompletableFuture<User> userFuture = getUserAsync(1);
CompletableFuture<List<Post>> postsFuture = userFuture
    .thenCompose(user -> getPostsAsync(user.getId()));

// Java không có từ khóa await, phải dùng callback-style</code></pre>

            <p><strong>Go (goroutines với channels):</strong></p>
            <pre><code>func fetchData() {
    userChan := make(chan User)
    go func() { userChan <- getUser() }()
    user := <-userChan // Block cho đến khi có data
}

// Go dùng goroutines (lightweight threads) thay vì async/await</code></pre>

            <h3>7. Common Mistakes và Best Practices</h3>

            <p><strong>Mistake 1: Await trong array methods</strong></p>
            <pre><code>// SAI: forEach không chờ await
users.forEach(async (user) => {
    await processUser(user); // Không có tác dụng!
});

// ĐÚNG: Dùng for-of
for (const user of users) {
    await processUser(user);
}

// HOẶC: Dùng map + Promise.all
await Promise.all(users.map(user => processUser(user)));</code></pre>

            <p><strong>Mistake 2: Không return trong async function</strong></p>
            <pre><code>// SAI
async function getUser() {
    const user = await fetchUser();
    // Quên return → function trả về Promise<undefined>
}

// ĐÚNG
async function getUser() {
    const user = await fetchUser();
    return user; // Hoặc: return await fetchUser();
}</code></pre>

            <p><strong>Mistake 3: Top-level await trong cũ Node.js</strong></p>
            <pre><code>// SAI (Node < 14.8 không support)
const user = await getUser();

// ĐÚNG: Wrap trong async IIFE
(async () => {
    const user = await getUser();
    console.log(user);
})();</code></pre>
            <p><em>Lưu ý: Node 14.8+ và ES modules đã hỗ trợ top-level await.</em></p>

            <h3>8. Async/Await và Event Loop</h3>
            <p>Để hiểu sâu hơn, cần hiểu Event Loop của JavaScript:</p>
            <ol>
                <li><strong>Call Stack:</strong> Nơi thực thi code đồng bộ</li>
                <li><strong>Web APIs:</strong> setTimeout, fetch, DOM events (do browser cung cấp)</li>
                <li><strong>Callback Queue:</strong> Callbacks từ setTimeout, setInterval</li>
                <li><strong>Microtask Queue:</strong> Promises, async/await (ưu tiên cao hơn Callback Queue)</li>
            </ol>

            <p><strong>Ví dụ phức tạp:</strong></p>
            <pre><code>console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

async function test() {
    console.log('4');
    await Promise.resolve();
    console.log('5');
}

test();
console.log('6');

// Output: 1, 4, 6, 3, 5, 2
// Giải thích:
// - 1, 4, 6: Synchronous code chạy trước
// - 3, 5: Microtasks (Promises) chạy tiếp
// - 2: Macrotask (setTimeout) chạy cuối cùng</code></pre>

            <h3>9. Performance Tips</h3>
            <ol>
                <li><strong>Tránh await không cần thiết:</strong>
                    <pre><code>// Chậm
async function getUser() {
    return await fetchUser(); // await thừa
}

// Nhanh
async function getUser() {
    return fetchUser(); // Return Promise trực tiếp
}</code></pre>
                </li>
                <li><strong>Dùng Promise.allSettled cho fault tolerance:</strong>
                    <pre><code>// Nếu 1 trong 3 fail, cả 3 đều fail
await Promise.all([task1(), task2(), task3()]);

// Cả 3 đều chạy, không quan tâm success/fail
const results = await Promise.allSettled([task1(), task2(), task3()]);
results.forEach(result => {
    if (result.status === 'fulfilled') {
        console.log(result.value);
    } else {
        console.error(result.reason);
    }
});</code></pre>
                </li>
                <li><strong>Race condition với Promise.race:</strong>
                    <pre><code>// Lấy kết quả của task nhanh nhất
const result = await Promise.race([
    fetchFromServer1(),
    fetchFromServer2(),
    fetchFromCache()
]);
// Useful cho timeout:
const result = await Promise.race([
    fetchData(),
    timeout(5000) // Fail nếu > 5s
]);</code></pre>
                </li>
            </ol>

            <p class="quote-box">Kết luận: Async/Await không phải là magic, nó chỉ là Syntactic Sugar làm Promise dễ đọc hơn. Hiểu rõ bản chất Non-blocking của JavaScript giúp bạn tránh được các lỗi performance nghiêm trọng. Hãy luôn tận dụng sức mạnh song song của JavaScript với Promise.all/race/allSettled. Và đừng quên: await trong loop có thể giết chết hiệu năng nếu bạn không cẩn thận!</p>
        `
    },
    {
        id: "encoding-utf8-mystery",
        title: "Tại sao chữ 'Ư' lại biến thành hình thoi ◊? Chuyện về Encoding và Database",
        date: "14/12/2025",
        category: "tech",
        image: "images/blog/Encoding UTF-8 Mystery.png",
        summary: "Bạn lưu tên 'Đặng Thành Đức' vào Database, nhưng nó hiện ra 'Äá»©c' hoặc '???'. Tại sao? Cùng giải mã bí ẩn UTF-8 và utf8mb4.",
        content: `
            <p><strong>1. Cú sốc đầu đời: "Web em bị lỗi font rồi anh ơi!"</strong></p>
            <p>Hồi mới làm đồ án Web bán hàng, mình test ngon lành trên máy mình. Nhưng khi deploy lên host, toàn bộ tên sản phẩm tiếng Việt biến thành dấu hỏi chấm (???) hoặc các ký tự giun dế.</p>
            <p>Mình đã mất 2 ngày để sửa CSS, cài lại Font chữ... nhưng vô dụng. Vì lỗi không nằm ở giao diện, nó nằm ở <strong>Database</strong>.</p>

            <p><strong>Timeline thảm họa:</strong></p>
            <ul>
                <li><strong>10h sáng:</strong> Code chạy ngon trên localhost. Text tiếng Việt hiển thị đầy đủ.</li>
                <li><strong>14h:</strong> Deploy lên hosting. Refresh trang web → "Äá»©c", "á»©Æ¡ng".</li>
                <li><strong>15h-17h:</strong> Mình xóa cache, thử 10 font chữ khác nhau, sửa CSS line-height, letter-spacing... vô dụng.</li>
                <li><strong>18h:</strong> Google "tiếng việt bị lỗi web" → Phát hiện từ khóa "UTF-8".</li>
                <li><strong>20h:</strong> Học được rằng MySQL mặc định của hosting dùng <code>latin1</code>, không phải <code>utf8mb4</code>.</li>
            </ul>

            <h3>2. ASCII vs UTF-8: Cái hộp nhỏ và Cái hộp to</h3>
            <p>Máy tính chỉ hiểu số 0 và 1. Để lưu chữ "A", người Mỹ dùng bảng mã <strong>ASCII</strong> (7-bit, chỉ 128 ký tự).</p>
            
            <p><strong>Bảng ASCII:</strong></p>
            <ul>
                <li>Số 65 → Chữ 'A'</li>
                <li>Số 97 → Chữ 'a'</li>
                <li>Số 48-57 → Chữ số '0' đến '9'</li>
            </ul>
            <p>Nhưng bảng này không có chữ "Đ", "Ê", "Ư", "à", "ã"... Nên người Việt Nam (và cả thế giới) không dùng được.</p>

            <p><strong>Extended ASCII (8-bit):</strong> Mở rộng lên 256 ký tự, nhưng vẫn không đủ cho tất cả ngôn ngữ trên thế giới.</p>

            <p><strong>UTF-8 (Universal Character Set):</strong></p>
            <p>UTF-8 giống như một cái hộp co giãn, tự động điều chỉnh kích thước dựa trên ký tự:</p>
            <ul>
                <li><strong>Chữ 'a':</strong> 1 byte (00000000-01111111) → 128 ký tự đầu tiên giống hệt ASCII</li>
                <li><strong>Chữ 'Đ':</strong> 2 bytes (11000010 10010000)</li>
                <li><strong>Chữ '中' (tiếng Trung):</strong> 3 bytes</li>
                <li><strong>Emoji 😎:</strong> 4 bytes (11110000 10011111 10011000 10001110)</li>
            </ul>

            <p><strong>Ví dụ thực tế:</strong></p>
            <pre><code>// Chuỗi "Hello Đức"
H: 0x48 (1 byte)
e: 0x65 (1 byte)
l: 0x6C (1 byte)
l: 0x6C (1 byte)
o: 0x6F (1 byte)
(space): 0x20 (1 byte)
Đ: 0xC490 (2 bytes)
ú: 0xC3BA (2 bytes)
c: 0x63 (1 byte)

Tổng: 11 bytes (không phải 9 ký tự = 9 bytes!)</code></pre>

            <h3>3. Vấn đề xảy ra khi: Character Set không khớp</h3>
            <p>Lỗi xảy ra khi: Bạn gửi 1 cục data 2-bytes (chữ Đ) vào một cái ô Database chỉ nhận 1-byte (Latin1). Nó sẽ cắt đôi chữ "Đ" ra thành 2 ký tự vô nghĩa.</p>

            <p><strong>Case 1: Database dùng latin1, Application gửi UTF-8</strong></p>
            <pre><code>// Application code (UTF-8):
String name = "Đức"; // 0xC490 0xC3BA 0x63

// Database nhận (latin1, mỗi byte = 1 ký tự):
Byte 1: 0xC4 → 'Ä'
Byte 2: 0x90 → Ký tự đặc biệt không hiển thị
Byte 3: 0xC3 → 'Ã'
Byte 4: 0xBA → 'º'
Byte 5: 0x63 → 'c'

// Kết quả hiển thị: "Äº" (mojibake - ký tự rác)</code></pre>

            <p><strong>Case 2: Database dùng UTF-8, nhưng Connection không set UTF-8</strong></p>
            <pre><code>// Java code
Connection conn = DriverManager.getConnection(
    "jdbc:mysql://localhost/mydb?characterEncoding=UTF-8" // QUAN TRỌNG
);

// Hoặc trong PHP:
$pdo = new PDO('mysql:host=localhost;dbname=mydb;charset=utf8mb4');</code></pre>
            <p>Nếu không set <code>characterEncoding</code>, JDBC driver mặc định dùng platform encoding (Windows: windows-1252, Linux: ISO-8859-1) → lỗi ngay!</p>

            <h3>4. utf8 vs utf8mb4: Cú lừa của MySQL</h3>
            <p>Trong MySQL, nếu bạn set charset là <code>utf8</code>, bạn nghĩ là xong? <strong>SAI.</strong></p>
            
            <p><strong>Sự thật đau lòng:</strong></p>
            <ul>
                <li><strong>utf8 (MySQL):</strong> Chỉ hỗ trợ tối đa <strong>3 bytes</strong> per character. Đây là implementation lỗi thời từ năm 2003.</li>
                <li><strong>utf8mb4 (MySQL):</strong> Hỗ trợ đầy đủ <strong>4 bytes</strong> (mb4 = multibyte 4). Đây mới là UTF-8 chuẩn.</li>
            </ul>

            <p><strong>Vấn đề thực tế:</strong></p>
            <pre><code>-- Tạo table với utf8 (SAI)
CREATE TABLE users (
    name VARCHAR(100) CHARACTER SET utf8
);

-- Insert tiếng Việt → OK (2 bytes)
INSERT INTO users VALUES ('Đức'); -- OK

-- Insert Emoji → LỖI!
INSERT INTO users VALUES ('Hello 😎'); 
-- ERROR: Incorrect string value: '\xF0\x9F\x98\x8E' for column 'name'</code></pre>

            <p><strong>Nguyên nhân:</strong> Emoji 😎 cần 4 bytes (0xF0 0x9F 0x98 0x8E), nhưng <code>utf8</code> chỉ chấp nhận tối đa 3 bytes.</p>

            <p><strong>Giải pháp:</strong></p>
            <pre><code>-- ĐÚNG: Dùng utf8mb4
CREATE TABLE users (
    name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Hoặc set default cho toàn Database:
ALTER DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;</code></pre>

            <p><strong>Migrate từ utf8 sang utf8mb4:</strong></p>
            <pre><code>-- Backup database trước!
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;</code></pre>

            <h3>5. Collation: utf8mb4_unicode_ci vs utf8mb4_general_ci</h3>
            <p>Collation quyết định cách so sánh và sắp xếp ký tự.</p>

            <ul>
                <li><strong>utf8mb4_general_ci:</strong> 
                    <ul>
                        <li>Nhanh hơn (không phân biệt accent)</li>
                        <li>"a" = "à" = "ả" = "ã" = "á" = "ạ" (6 ký tự này được coi là giống nhau)</li>
                        <li>Dùng cho: Search không dấu</li>
                    </ul>
                </li>
                <li><strong>utf8mb4_unicode_ci:</strong>
                    <ul>
                        <li>Chính xác hơn (phân biệt accent)</li>
                        <li>"a" ≠ "à" ≠ "ả"</li>
                        <li>Dùng cho: Lưu trữ chính xác</li>
                    </ul>
                </li>
                <li><strong>utf8mb4_vietnamese_ci:</strong>
                    <ul>
                        <li>Tối ưu cho tiếng Việt</li>
                        <li>Sắp xếp đúng thứ tự bảng chữ cái Việt (Ă sau A, Đ sau D...)</li>
                    </ul>
                </li>
            </ul>

            <p><strong>Demo so sánh:</strong></p>
            <pre><code>-- With utf8mb4_general_ci:
SELECT * FROM users WHERE name = 'Duc';
-- Returns: "Duc", "Đức", "Dúc", "Dục", "Dức" (tất cả!)

-- With utf8mb4_unicode_ci:
SELECT * FROM users WHERE name = 'Duc';
-- Returns: Only "Duc"

-- With utf8mb4_vietnamese_ci:
SELECT name FROM users ORDER BY name;
-- "An", "Ân", "Bình", "Đức", "Dương" (đúng thứ tự Việt Nam)</code></pre>

            <h3>6. Full Stack Encoding: 7 lớp cần kiểm tra</h3>
            <p>Để tránh lỗi encoding, bạn phải đảm bảo UTF-8 xuyên suốt từ đầu đến cuối:</p>

            <p><strong>Layer 1: Database</strong></p>
            <pre><code>CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;</code></pre>

            <p><strong>Layer 2: Tables</strong></p>
            <pre><code>CREATE TABLE users (
    name VARCHAR(100) CHARACTER SET utf8mb4
) DEFAULT CHARSET=utf8mb4;</code></pre>

            <p><strong>Layer 3: Connection String</strong></p>
            <pre><code>// Java
jdbc:mysql://localhost/mydb?characterEncoding=UTF-8&useUnicode=true

// PHP
new PDO('mysql:host=localhost;dbname=mydb;charset=utf8mb4')

// Python
pymysql.connect(charset='utf8mb4')

// Node.js
mysql.createConnection({ charset: 'utf8mb4' })</code></pre>

            <p><strong>Layer 4: HTML Meta Tag</strong></p>
            <pre><code>&lt;meta charset="UTF-8"&gt;</code></pre>

            <p><strong>Layer 5: HTTP Header</strong></p>
            <pre><code>Content-Type: text/html; charset=utf-8</code></pre>

            <p><strong>Layer 6: Server Config</strong></p>
            <pre><code>// Apache .htaccess
AddDefaultCharset UTF-8

// Nginx
charset utf-8;</code></pre>

            <p><strong>Layer 7: Source Code File</strong></p>
            <p>Save file với UTF-8 encoding (trong VS Code: Bottom right → "UTF-8")</p>

            <h3>7. Debugging Encoding Issues</h3>

            <p><strong>Tool 1: Kiểm tra Database</strong></p>
            <pre><code>-- Xem charset của database
SHOW VARIABLES LIKE 'character_set%';

-- Xem charset của table
SHOW CREATE TABLE users;

-- Xem charset của column
SELECT column_name, character_set_name 
FROM information_schema.columns 
WHERE table_name = 'users';</code></pre>

            <p><strong>Tool 2: Hex Dump</strong></p>
            <pre><code>// JavaScript
const str = "Đức";
for (let i = 0; i < str.length; i++) {
    console.log(str.charCodeAt(i).toString(16));
}
// Output: 110 (Đ), 1ee9 (ứ), 63 (c)

// Python
"Đức".encode('utf-8').hex()
# Output: 'c490c3ba63'</code></pre>

            <p><strong>Tool 3: Online Debugger</strong></p>
            <p>Website: <code>https://www.fileformat.info/info/unicode/char/search.htm</code></p>
            <p>Paste ký tự lỗi → Xem Unicode codepoint → Biết được encoding gốc.</p>

            <h3>8. Common Mistakes và Solutions</h3>

            <p><strong>Mistake 1: Copy-paste từ Word vào Web Form</strong></p>
            <p>Word dùng smart quotes ("") thay vì straight quotes (""). Những ký tú này nằm trong vùng Windows-1252, không phải UTF-8 thuần.</p>
            <p><strong>Solution:</strong> Sanitize input trước khi lưu DB:</p>
            <pre><code>// JavaScript
text = text.replace(/[\u2018\u2019]/g, "'") // Smart single quotes
           .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
           .replace(/\u2013/g, '-')         // En dash
           .replace(/\u2014/g, '--');       // Em dash</code></pre>

            <p><strong>Mistake 2: Excel Export CSV</strong></p>
            <p>Excel export CSV mặc định dùng Windows-1252, không phải UTF-8.</p>
            <p><strong>Solution:</strong> Save as "CSV UTF-8 (Comma delimited)"</p>

            <p><strong>Mistake 3: Email subject line bị lỗi</strong></p>
            <pre><code>// SAI
mail('user@example.com', 'Thông báo', $body);

// ĐÚNG
$subject = '=?UTF-8?B?' . base64_encode('Thông báo') . '?=';
mail('user@example.com', $subject, $body);</code></pre>

            <h3>9. Performance Impact của UTF-8</h3>

            <p><strong>Storage size:</strong></p>
            <ul>
                <li><code>VARCHAR(100)</code> với <code>latin1</code>: Max 100 bytes</li>
                <li><code>VARCHAR(100)</code> với <code>utf8mb4</code>: Max 400 bytes (100 chars × 4 bytes/char)</li>
            </ul>

            <p><strong>Index size:</strong></p>
            <pre><code>-- latin1: Index key max = 767 bytes → VARCHAR(767)
CREATE INDEX idx_name ON users(name(767));

-- utf8mb4: Index key max = 767 bytes → VARCHAR(191) only!
-- Vì 767 / 4 = 191.75
CREATE INDEX idx_name ON users(name(191));</code></pre>

            <p><strong>Workaround:</strong></p>
            <pre><code>-- Enable larger index keys (MySQL 5.7+)
SET GLOBAL innodb_large_prefix = ON;
SET GLOBAL innodb_file_format = Barracuda;

ALTER TABLE users 
ROW_FORMAT=DYNAMIC;

-- Now can index up to 3072 bytes
CREATE INDEX idx_name ON users(name(768));</code></pre>

            <p class="quote-box">Kết luận: Encoding là một trong những vấn đề "ẩn" nhất trong lập trình. Bạn có thể code ngon lành nhưng lại mất hàng giờ debug chỉ vì quên set charset. Bài học xương máu: LUÔN LUÔN chọn <code>utf8mb4</code> khi tạo Database. Đừng bao giờ tin vào mặc định. Và nhớ kiểm tra cả 7 layers: Database → Table → Connection → HTML → HTTP → Server → Source File!</p>
        `
    },
     {
        id: "password-hashing-salt",
        title: "Lưu mật khẩu: Đừng bao giờ lưu Plain Text! (Hashing & Salting)",
        date: "6/12/2026",
        category: "tech",
        image: "images/blog/Password Hashing and Salting.png",
        summary: "Nếu Database bị hack, hacker có nhìn thấy mật khẩu của user là '123456' không? Phân biệt Hashing (Băm) và Encryption (Mã hóa).",
        content: `
            <p><strong>1. "Em lưu mật khẩu y nguyên cho dễ nhớ"</strong></p>
            <p>Trong đồ án môn học, nhiều bạn lưu mật khẩu user vào cột <code>password</code> dạng: "iloveyou", "123456".</p>
            <p>Nếu Hacker tấn công SQL Injection và dump được database, hắn sẽ có toàn bộ mật khẩu. Và vì user thường dùng chung 1 pass cho Facebook, Email, Bank... hậu quả là khôn lường.</p>

            <p><strong>Case study thực tế: LinkedIn breach 2012</strong></p>
            <p>Năm 2012, LinkedIn bị hack, <strong>6.5 triệu</strong> mật khẩu user bị leak. Điều tồi tệ? LinkedIn lưu password bằng SHA-1 (không có salt). Trong vòng vài giờ, hacker đã crack được <strong>90%</strong> mật khẩu.</p>
            <p>Hậu quả: Nhiều user dùng chung password cho email, bank account → Bị hack dây chuyền.</p>

            <h3>2. Hashing (Băm) khác gì Encryption (Mã hóa)?</h3>
            
            <p><strong>Encryption (Mã hóa) - Two-way function:</strong></p>
            <ul>
                <li>Biến A thành B bằng một chìa khóa (key)</li>
                <li>Có thể dịch ngược lại từ B thành A nếu có key</li>
                <li>Ví dụ: AES, RSA</li>
            </ul>
            <pre><code>// Encryption
plaintext = "hello"
key = "secretkey123"
encrypted = encrypt(plaintext, key) // → "8fh3j2k1..."
decrypted = decrypt(encrypted, key) // → "hello"</code></pre>

            <p><strong>Hashing (Băm) - One-way function:</strong></p>
            <ul>
                <li>Biến A thành B (hash)</li>
                <li><strong>KHÔNG THỂ</strong> dịch ngược lại từ B thành A</li>
                <li>Giống như bạn băm thịt bò thành burger, không thể biến burger lại thành con bò</li>
                <li>Ví dụ: MD5, SHA-256, BCrypt, Argon2</li>
            </ul>
            <pre><code>// Hashing
password = "hello"
hashed = hash(password) // → "$2a$10$N9qo8uLOickgx2ZMRZoMy..."

// Không thể reverse
unhash(hashed) // → IMPOSSIBLE!</code></pre>

            <p><strong>Tại sao password phải dùng Hashing chứ không phải Encryption?</strong></p>
            <p>Vì <strong>server không cần biết mật khẩu gốc là gì</strong>. Server chỉ cần verify: "Mật khẩu user vừa nhập có khớp với hash trong DB không?"</p>
            <pre><code>// Login flow
1. User nhập: password = "mypassword123"
2. Server hash: hash("mypassword123") = "ABC123XYZ"
3. Server so sánh: "ABC123XYZ" == hash_trong_DB ?
4. Nếu khớp → Login thành công</code></pre>

            <h3>3. Tại sao MD5 và SHA-1 đã chết?</h3>

            <p><strong>MD5 (Message Digest 5) - Năm 1991:</strong></p>
            <ul>
                <li>Hash length: 128-bit (32 ký tự hex)</li>
                <li>Tốc độ: CỰC NHANH (~450 MB/s)</li>
                <li>Vấn đề: Quá nhanh → Hacker có thể brute-force dễ dàng</li>
            </ul>

            <p><strong>Ví dụ tấn công MD5:</strong></p>
            <pre><code>MD5("123456") = "e10adc3949ba59abbe56e057f20f883e"

// Hacker có sẵn Rainbow Table (bảng tra cứu):
"e10adc3949ba59abbe56e057f20f883e" → "123456"
// Crack ngay lập tức!</code></pre>

            <p><strong>Rainbow Table là gì?</strong></p>
            <p>Là một bảng tra cứu khổng lồ chứa sẵn millions hashes:</p>
            <pre><code>// Rainbow table mẫu
"5f4dcc3b5aa765d61d8327deb882cf99" → "password"
"e10adc3949ba59abbe56e057f20f883e" → "123456"
"25d55ad283aa400af464c76d713c07ad" → "12345678"
...</code></pre>
            <p>Hacker chỉ cần lookup hash → Có ngay password gốc. Tốc độ: <strong>1 billion hashes/giây</strong> với GPU hiện đại.</p>

            <p><strong>SHA-1 (Secure Hash Algorithm) - Năm 1995:</strong></p>
            <ul>
                <li>Hash length: 160-bit (40 ký tự hex)</li>
                <li>An toàn hơn MD5 một chút, nhưng vẫn quá nhanh</li>
                <li>Google đã chứng minh collision attack năm 2017</li>
            </ul>

            <h3>4. Giải pháp hiện đại: Bcrypt + Salt</h3>

            <p><strong>Salt (Muối) là gì?</strong></p>
            <p>Salt là một chuỗi ngẫu nhiên thêm vào mật khẩu trước khi băm:</p>
            <pre><code>// Không có salt
Hash("123456") = "e10adc3949ba59abbe56e057f20f883e"
// Tất cả users có password "123456" đều có hash giống nhau!

// Có salt
Hash("123456" + "salt_abc123") = "9f2e1c..."
Hash("123456" + "salt_xyz789") = "7a4d3b..."
// Hai users cùng password nhưng hash khác nhau hoàn toàn!</code></pre>

            <p><strong>Bcrypt - The Industry Standard:</strong></p>
            <ul>
                <li>Designed to be SLOW (cost factor configurable)</li>
                <li>Built-in salt generation (random 128-bit salt)</li>
                <li>Output format: <code>$2a$cost$salthash</code></li>
            </ul>

            <p><strong>Anatomy of Bcrypt Hash:</strong></p>
            <pre><code>$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
│  │  │ │                                                │
│  │  │ └─ Salt (22 chars)                              └─ Hash (31 chars)
│  │  └─ Cost factor (2^10 = 1024 iterations)
│  └─ Minor version
└─ Algorithm identifier (Bcrypt)</code></pre>

            <p><strong>Cost Factor (Work Factor):</strong></p>
            <p>Cost = 10 nghĩa là hash sẽ chạy 2^10 = 1024 rounds. Càng cao càng chậm càng an toàn:</p>
            <ul>
                <li><strong>Cost 10:</strong> ~100ms per hash (recommended for login)</li>
                <li><strong>Cost 12:</strong> ~400ms per hash (more secure)</li>
                <li><strong>Cost 14:</strong> ~1.6s per hash (very secure, but slow)</li>
            </ul>

            <p><strong>Code examples:</strong></p>
            <pre><code>// Java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10); // cost = 10

// Signup: Hash password
String rawPassword = "mypassword123";
String hashedPassword = encoder.encode(rawPassword);
// Save to DB: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIj..."

// Login: Verify password
boolean isMatch = encoder.matches(rawPassword, hashedPassword);
// Returns: true</code></pre>

            <pre><code>// Node.js
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Signup
const password = 'mypassword123';
const hash = await bcrypt.hash(password, saltRounds);
// Save to DB: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIj..."

// Login
const isMatch = await bcrypt.compare(password, hash);
// Returns: true</code></pre>

            <pre><code>// Python
import bcrypt

# Signup
password = b"mypassword123"
salt = bcrypt.gensalt(rounds=10)
hashed = bcrypt.hashpw(password, salt)
# Save to DB: b'$2b$10$N9qo8uLOickgx2ZMRZoMyeIj...'

# Login
isMatch = bcrypt.checkpw(password, hashed)
# Returns: True</code></pre>

            <h3>5. Argon2: The Future of Password Hashing</h3>

            <p><strong>Argon2 - Winner of Password Hashing Competition 2015:</strong></p>
            <ul>
                <li>Có 3 variants: Argon2d (fast), Argon2i (side-channel resistant), Argon2id (hybrid - recommended)</li>
                <li>Configurable: time cost, memory cost, parallelism</li>
                <li>Resistant to GPU/ASIC attacks (memory-hard)</li>
            </ul>

            <p><strong>So sánh Bcrypt vs Argon2:</strong></p>
            <table>
                <tr><th>Feature</th><th>Bcrypt</th><th>Argon2</th></tr>
                <tr><td>Year</td><td>1999</td><td>2015</td></tr>
                <tr><td>Memory hard</td><td>❌</td><td>✅</td></tr>
                <tr><td>Parallelism</td><td>❌</td><td>✅</td></tr>
                <tr><td>GPU resistant</td><td>Moderate</td><td>Strong</td></tr>
                <tr><td>Config options</td><td>1 (cost)</td><td>3 (time, memory, threads)</td></tr>
                <tr><td>Industry adoption</td><td>Very high</td><td>Growing</td></tr>
            </table>

            <p><strong>Code example Argon2:</strong></p>
            <pre><code>// Java (with Bouncy Castle)
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;

Argon2BytesGenerator generator = new Argon2BytesGenerator();
generator.init(new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
    .withIterations(3)      // time cost
    .withMemoryAsKB(65536)  // memory cost (64 MB)
    .withParallelism(4)     // threads
    .withSalt("randomsalt".getBytes())
    .build());

byte[] hash = new byte[32];
generator.generateBytes("mypassword123".getBytes(), hash);</code></pre>

            <h3>6. Common Attacks và Defense</h3>

            <p><strong>Attack 1: Brute Force</strong></p>
            <p>Hacker thử tất cả combinations: "a", "aa", "aaa", ... "zzzzz"</p>
            <p><strong>Defense:</strong></p>
            <ul>
                <li>Enforce strong password policy (min 8 chars, uppercase, numbers, special chars)</li>
                <li>Use slow hash (Bcrypt cost 12+, Argon2 with high memory)</li>
                <li>Rate limiting: Max 5 login attempts / 15 minutes</li>
            </ul>

            <p><strong>Attack 2: Dictionary Attack</strong></p>
            <p>Hacker dùng wordlist (millions common passwords): "password", "123456", "qwerty"...</p>
            <p><strong>Defense:</strong></p>
            <ul>
                <li>Check against common password database (HaveIBeenPwned API)</li>
                <li>Reject weak passwords during signup</li>
            </ul>

            <p><strong>Attack 3: Rainbow Table</strong></p>
            <p>Pre-computed hash lookup table</p>
            <p><strong>Defense:</strong></p>
            <ul>
                <li><strong>Salt!</strong> Rainbow tables become useless with unique salts</li>
            </ul>

            <p><strong>Attack 4: Timing Attack</strong></p>
            <p>Measure response time to deduce information:</p>
            <pre><code>// VULNERABLE CODE
if (username == "admin" && password_hash == stored_hash) {
    return "success";
}
// If username wrong → fast response (10ms)
// If username correct but password wrong → slow response (100ms)
// Hacker knows "admin" exists!</code></pre>
            <p><strong>Defense:</strong></p>
            <pre><code>// SECURE CODE - Always take same time
boolean usernameMatch = constantTimeCompare(username, "admin");
boolean passwordMatch = bcrypt.verify(password, stored_hash);

if (usernameMatch && passwordMatch) {
    return "success";
} else {
    Thread.sleep(random(100, 200)); // Add jitter
    return "Invalid credentials"; // Generic message
}</code></pre>

            <h3>7. Best Practices Checklist</h3>

            <ol>
                <li><strong>✅ Never store plaintext passwords</strong></li>
                <li><strong>✅ Use Bcrypt (cost 10-12) or Argon2id</strong></li>
                <li><strong>✅ Salt is automatic with Bcrypt/Argon2</strong> (don't implement yourself!)</li>
                <li><strong>✅ Enforce password strength:</strong>
                    <ul>
                        <li>Minimum 8 characters</li>
                        <li>At least 1 uppercase, 1 lowercase, 1 number, 1 special char</li>
                        <li>Check against breached password lists</li>
                    </ul>
                </li>
                <li><strong>✅ Implement rate limiting:</strong>
                    <pre><code>// Express.js with express-rate-limit
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, try again later'
});</code></pre>
                </li>
                <li><strong>✅ Add 2FA (Two-Factor Authentication):</strong> TOTP (Google Authenticator), SMS, Email</li>
                <li><strong>✅ Use constant-time comparison</strong> to prevent timing attacks</li>
                <li><strong>✅ Log failed login attempts:</strong> Monitor for brute force attacks</li>
                <li><strong>✅ Implement account lockout:</strong> After 5 failed attempts, lock for 15 minutes</li>
                <li><strong>✅ Use HTTPS</strong> for login pages (prevent man-in-the-middle)</li>
            </ol>

            <h3>8. Password Reset Flow (Secure Implementation)</h3>

            <p><strong>❌ INSECURE way:</strong></p>
            <pre><code>// Send password in email
"Your password is: mypassword123"
// NEVER DO THIS!</code></pre>

            <p><strong>✅ SECURE way:</strong></p>
            <ol>
                <li>User clicks "Forgot password"</li>
                <li>Generate random token (32-byte random string):
                    <pre><code>const token = crypto.randomBytes(32).toString('hex');
// "a3f5e2c1b9d8..."</code></pre>
                </li>
                <li>Store token in DB with expiration (15 minutes):
                    <pre><code>INSERT INTO password_resets (email, token, expires_at)
VALUES ('user@example.com', 'a3f5e2c1...', NOW() + INTERVAL 15 MINUTE);</code></pre>
                </li>
                <li>Send email with link: <code>https://yoursite.com/reset?token=a3f5e2c1...</code></li>
                <li>User clicks link, enters NEW password</li>
                <li>Server verifies token is valid and not expired</li>
                <li>Hash new password and update DB</li>
                <li>Delete token from password_resets table</li>
            </ol>

            <h3>9. Real-world Data Breaches (Learn from mistakes)</h3>

            <p><strong>Case 1: Adobe (2013) - 153 million accounts</strong></p>
            <ul>
                <li>Used DES encryption (not hashing!) with same key for all</li>
                <li>No salt</li>
                <li>Result: All passwords decrypted in days</li>
            </ul>

            <p><strong>Case 2: LinkedIn (2012) - 6.5 million accounts</strong></p>
            <ul>
                <li>Used SHA-1 without salt</li>
                <li>Result: 90% cracked in hours</li>
            </ul>

            <p><strong>Case 3: Ashley Madison (2015) - 36 million accounts</strong></p>
            <ul>
                <li>Used Bcrypt (good!)</li>
                <li>But also stored plaintext passwords for some accounts (WHY?!)</li>
                <li>Result: Partial breach, massive scandal</li>
            </ul>

            <p><strong>Case 4: Facebook (2019) - 600 million accounts</strong></p>
            <ul>
                <li>Accidentally logged passwords in plaintext to internal logs</li>
                <li>Accessible by 20,000 employees</li>
                <li>Result: No external breach, but massive trust violation</li>
            </ul>

            <h3>10. Testing Your Implementation</h3>

            <p><strong>Unit tests:</strong></p>
            <pre><code>// Test 1: Hashing produces different outputs for same input
test('bcrypt generates unique hashes', async () => {
    const password = 'test123';
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);
    expect(hash1).not.toBe(hash2); // Different salts
});

// Test 2: Verification works
test('bcrypt verifies correct password', async () => {
    const password = 'test123';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
});

// Test 3: Wrong password fails
test('bcrypt rejects wrong password', async () => {
    const hash = await bcrypt.hash('correct', 10);
    const isValid = await bcrypt.compare('wrong', hash);
    expect(isValid).toBe(false);
});</code></pre>

            <p class="quote-box">Kết luận: Password security không phải chuyện đùa. Một lỗi nhỏ có thể dẫn đến breach ảnh hưởng millions users. Quy tắc vàng: NEVER store plaintext. ALWAYS use Bcrypt (cost 10+) hoặc Argon2. ALWAYS add rate limiting và 2FA. Và quan trọng nhất: Test kỹ implementation của bạn. Security không phải là feature bạn thêm sau, nó phải được baked in từ đầu!</p>
        `
    },
    {
        id: "git-merge-conflict",
        title: "Git Conflict: Cơn ác mộng màn hình đỏ và cách sinh tồn",
        date: "15/12/2025",
        category: "work",
        image: "images/blog/Git Merge Conflict.png",
        summary: "Code chạy ngon trên máy mình, nhưng push lên thì đỏ lòm? Câu chuyện muôn thuở khi làm việc nhóm và văn hóa 'Pull trước khi Push'.",
        content: `
            <p><strong>1. Buổi tối định mệnh trước Deadline</strong></p>
            <p>Nhóm có 2 người: Mình (Backend) và bạn A (Frontend). Cả hai hì hục code cả đêm. 5h sáng, mình commit và push code lên GitHub. Thành công.</p>
            <p>5h05, bạn A push code lên. <strong>REJECTED.</strong></p>
            <pre><code>To https://github.com/username/project.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/username/project.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref. You may want to first integrate the remote changes</code></pre>
            <p>Bạn A hoảng loạn gọi điện: "Sao push không được? Em bị lỗi rồi!"</p>
            <p>Mình bảo: "Pull về đi". Bạn A <code>git pull</code>. Màn hình VS Code bùng nổ:</p>
            <pre><code>Auto-merging config.js
CONFLICT (content): Merge conflict in config.js
Automatic merge failed; fix conflicts and then commit the result.</code></pre>

            <p>Mở file <code>config.js</code> ra, thấy:</p>
            <pre><code><<<<<<< HEAD (Current Change)
const API_URL = "http://localhost:3000";
=======
const API_URL = "http://192.168.1.100:8080";
>>>>>>> 5f3e2c1 (Remote Change)</code></pre>
            <p>Đây là <strong>Merge Conflict</strong>. Cả hai cùng sửa dòng code đó, Git không biết nên nghe ai.</p>

            <h3>2. Tại sao Conflict xảy ra?</h3>

            <p><strong>Scenario phổ biến:</strong></p>
            <ol>
                <li><strong>T = 0h:</strong> Cả hai pull code về, file <code>config.js</code> có dòng:
                    <pre><code>const API_URL = "http://localhost:3000";</code></pre>
                </li>
                <li><strong>T = 1h-4h:</strong> Mình sửa thành <code>"http://localhost:3000"</code>, bạn A sửa thành <code>"http://192.168.1.100:8080"</code>. Cả hai đều không biết người kia đang sửa.</li>
                <li><strong>T = 5h:</strong> Mình commit và push trước → GitHub nhận code mình.</li>
                <li><strong>T = 5h05:</strong> Bạn A push → GitHub từ chối vì code trên server đã thay đổi (do mình push).</li>
                <li><strong>T = 5h06:</strong> Bạn A pull về → Git merge tự động → Phát hiện conflict!</li>
            </ol>

            <p><strong>Git không thể tự động merge khi:</strong></p>
            <ul>
                <li>Cùng sửa <strong>cùng một dòng</strong> trong cùng một file</li>
                <li>Một người xóa file, người kia sửa file đó</li>
                <li>Cùng thêm code vào cùng vị trí</li>
            </ul>

            <p><strong>Git CÓ THỂ tự động merge khi:</strong></p>
            <ul>
                <li>Sửa <strong>khác dòng</strong> trong cùng file (ví dụ: mình sửa dòng 10, bạn A sửa dòng 50)</li>
                <li>Sửa <strong>khác file</strong> (mình sửa <code>backend.js</code>, bạn A sửa <code>frontend.js</code>)</li>
            </ul>

            <h3>3. Bình tĩnh xử lý (Don't Panic!)</h3>

            <p>Nhiều bạn newbie thấy conflict là:</p>
            <ul>
                <li>❌ Xóa hết project, clone lại từ đầu</li>
                <li>❌ Copy code ra Notepad, xóa folder, paste lại</li>
                <li>❌ Gọi thầy/bạn giỏi cứu</li>
            </ul>
            <p><strong>Đừng làm thế!</strong> Conflict là chuyện bình thường, mọi developer đều gặp hàng ngày.</p>

            <p><strong>Quy trình xử lý từng bước:</strong></p>

            <p><strong>Bước 1: Xác định files bị conflict</strong></p>
            <pre><code>git status

# Output:
# On branch main
# You have unmerged paths.
#   (fix conflicts and run "git commit")
#
# Unmerged paths:
#   (use "git add <file>..." to mark resolution)
#         both modified:   config.js
#         both modified:   utils.js</code></pre>

            <p><strong>Bước 2: Mở file conflict, đọc kỹ markers</strong></p>
            <pre><code><<<<<<< HEAD (Current Change - code của bạn)
const API_URL = "http://localhost:3000";
=======
const API_URL = "http://192.168.1.100:8080";
>>>>>>> 5f3e2c1 (Incoming Change - code từ remote)</code></pre>

            <p>Giải thích:</p>
            <ul>
                <li><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code>: Code hiện tại trên máy bạn (local)</li>
                <li><code>=======</code>: Dấu phân cách</li>
                <li><code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; 5f3e2c1</code>: Code từ remote (GitHub)</li>
            </ul>

            <p><strong>Bước 3: Quyết định giữ code nào</strong></p>
            <p>Có 3 options:</p>
            <ul>
                <li><strong>Option 1: Giữ code của mình (Accept Current)</strong>
                    <pre><code>const API_URL = "http://localhost:3000";</code></pre>
                </li>
                <li><strong>Option 2: Giữ code của người khác (Accept Incoming)</strong>
                    <pre><code>const API_URL = "http://192.168.1.100:8080";</code></pre>
                </li>
                <li><strong>Option 3: Kết hợp cả hai (Accept Both / Manual Edit)</strong>
                    <pre><code>const API_URL = process.env.NODE_ENV === 'production' 
    ? "http://192.168.1.100:8080"  // Production (code của bạn A)
    : "http://localhost:3000";     // Development (code của mình)</code></pre>
                </li>
            </ul>

            <p><strong>Bước 4: Xóa các markers của Git</strong></p>
            <p>Sau khi quyết định, xóa hết các dòng <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>. Chỉ giữ lại code thực tế.</p>

            <p><strong>Bước 5: Stage và commit</strong></p>
            <pre><code>git add config.js utils.js
git commit -m "Resolve merge conflicts"
git push origin main</code></pre>

            <h3>4. VS Code giúp xử lý Conflict dễ dàng hơn</h3>

            <p>VS Code hiển thị conflict với UI thân thiện:</p>
            <pre><code>// File: config.js
const API_URL = "http://localhost:3000";
[Accept Current Change] [Accept Incoming Change] [Accept Both Changes] [Compare Changes]</code></pre>

            <p>Click vào button tương ứng, VS Code tự động xóa markers và giữ lại code bạn chọn. Siêu nhanh!</p>

            <h3>5. Git Commands để xử lý Conflict</h3>

            <p><strong>View conflict markers:</strong></p>
            <pre><code>git diff --ours      # Xem code của mình
git diff --theirs    # Xem code của người khác
git diff --base      # Xem code gốc trước khi conflict</code></pre>

            <p><strong>Choose strategy:</strong></p>
            <pre><code># Giữ toàn bộ code của mình, bỏ code của người khác
git checkout --ours config.js
git add config.js

# Giữ toàn bộ code của người khác, bỏ code của mình
git checkout --theirs config.js
git add config.js</code></pre>

            <p><strong>Abort merge (quay lại trạng thái trước khi pull):</strong></p>
            <pre><code>git merge --abort
# Hoặc
git reset --hard HEAD</code></pre>

            <h3>6. Văn hóa Git Flow để tránh Conflict</h3>

            <p>Để tránh thảm họa conflict deadline, team nên áp dụng quy tắc:</p>

            <p><strong>Rule 1: Pull Before You Code</strong></p>
            <pre><code># Mỗi sáng trước khi code:
git pull origin main

# Hoặc
git fetch origin
git rebase origin/main  # Prefer rebase over merge for cleaner history</code></pre>

            <p><strong>Rule 2: Commit Often, Commit Small</strong></p>
            <ul>
                <li>❌ Code 3 ngày, commit 1 lần → Conflict khổng lồ</li>
                <li>✅ Làm xong 1 feature nhỏ (30-60 phút) → Commit ngay</li>
            </ul>
            <pre><code># Bad: 1 commit cho toàn bộ feature
git commit -m "Add login feature" (500 lines changed)

# Good: Many small commits
git commit -m "Add login UI"
git commit -m "Add login API endpoint"
git commit -m "Add JWT authentication"
git commit -m "Add login validation"</code></pre>

            <p><strong>Rule 3: Feature Branch Workflow</strong></p>
            <p>Đừng ai cũng push thẳng vào <code>main</code>. Hãy tạo nhánh riêng:</p>
            <pre><code># Tạo branch mới từ main
git checkout -b feature/user-login

# Code xong, push lên branch riêng
git push origin feature/user-login

# Tạo Pull Request trên GitHub
# Team review code
# Merge vào main sau khi approved</code></pre>

            <p><strong>Ưu điểm:</strong></p>
            <ul>
                <li>Code của mỗi người isolated, không ảnh hưởng lẫn nhau</li>
                <li>Main branch luôn stable (không bị code lỗi)</li>
                <li>Dễ code review</li>
                <li>Dễ rollback nếu có bug</li>
            </ul>

            <p><strong>Rule 4: Communication (Giao tiếp)</strong></p>
            <p>Trước khi sửa một file quan trọng, hỏi trong group:</p>
            <blockquote>"Mình sắp sửa file config.js, ai đang sửa không? Để mình sửa xong các bạn sửa sau."</blockquote>
            <p>Điều phối thời gian để tránh conflict không cần thiết.</p>

            <h3>7. Advanced: Rebase vs Merge</h3>

            <p><strong>Merge (Default):</strong></p>
            <pre><code>git pull origin main
# = git fetch + git merge

# History:
A---B---C (main)
     \
      D---E (feature)
           \
            M (merge commit)</code></pre>
            <p>Tạo ra merge commit, history phức tạp.</p>

            <p><strong>Rebase (Clean History):</strong></p>
            <pre><code>git pull --rebase origin main
# = git fetch + git rebase

# History:
A---B---C (main)
         \
          D'---E' (feature rebased)</code></pre>
            <p>Di chuyển commits của bạn lên đỉnh, history tuyến tính đẹp hơn.</p>

            <p><strong>Khi nào dùng gì?</strong></p>
            <ul>
                <li><strong>Merge:</strong> Dùng cho public branches (main, develop). Preserve history.</li>
                <li><strong>Rebase:</strong> Dùng cho feature branches cá nhân. Clean history.</li>
            </ul>

            <p class="quote-box">Golden Rule: NEVER rebase commits that have been pushed to public branches!</p>

            <h3>8. Tools hỗ trợ xử lý Conflict</h3>

            <p><strong>1. VS Code (Built-in):</strong></p>
            <ul>
                <li>Highlight conflicts với colors</li>
                <li>One-click resolution buttons</li>
                <li>Compare changes side-by-side</li>
            </ul>

            <p><strong>2. Git Extensions / GitKraken:</strong></p>
            <ul>
                <li>Visual merge tool</li>
                <li>3-way merge view (base, ours, theirs)</li>
                <li>Drag-and-drop resolution</li>
            </ul>

            <p><strong>3. Command line (vimdiff, meld):</strong></p>
            <pre><code>git config --global merge.tool vimdiff
git mergetool</code></pre>

            <h3>9. Common Mistakes và Solutions</h3>

            <p><strong>Mistake 1: Force push sau conflict</strong></p>
            <pre><code># DANGER: Overwrites remote history
git push --force origin main

# Hậu quả: Xóa mất code của teammates!</code></pre>
            <p><strong>Solution:</strong> Never force push to shared branches. Nếu bắt buộc phải force push (ví dụ sau rebase), dùng:</p>
            <pre><code># Safer: Only force if no one else pushed
git push --force-with-lease origin main</code></pre>

            <p><strong>Mistake 2: Resolve conflict sai, commit lỗi code</strong></p>
            <p><strong>Solution:</strong> Sau khi resolve, nhớ test kỹ:</p>
            <pre><code># After resolving conflicts:
npm test         # Run tests
npm run build    # Make sure it builds
git add .
git commit</code></pre>

            <p><strong>Mistake 3: Commit các markers vào code</strong></p>
            <pre><code>// BAD: Forgot to remove markers
const x = 2;

// This breaks the code!</code></pre>
            <p><strong>Solution:</strong> Luôn search toàn bộ project trước khi commit:</p>
            <pre><code># Search for conflict markers
grep -r "<<<<<" .
grep -r ">>>>>" .
grep -r "=====" .</code></pre>

            <h3>10. Emergency: Conflict quá phức tạp, không giải quyết được</h3>

            <p><strong>Plan A: Abort và làm lại</strong></p>
            <pre><code>git merge --abort
# Hoặc
git rebase --abort

# Start fresh:
git stash  # Save your work
git pull origin main
git stash pop  # Re-apply your changes</code></pre>

            <p><strong>Plan B: Cherry-pick từng commit</strong></p>
            <pre><code># Lấy commit hash của code tốt
git log --oneline

# Cherry-pick từng commit một
git cherry-pick abc123
git cherry-pick def456</code></pre>

            <p><strong>Plan C: Manual merge</strong></p>
            <pre><code># Backup your code
cp -r project project_backup

# Reset về remote
git reset --hard origin/main

# Manually copy-paste your changes từ backup
# Test kỹ, rồi commit</code></pre>

            <p class="quote-box">Kết luận: Git Conflict không phải là lỗi, nó là tính năng. Nó ép các thành viên trong team phải giao tiếp với nhau về việc ai đang sửa gì. Master được Git conflict handling là một skill quan trọng của mọi developer. Hãy nhớ 3 nguyên tắc vàng: (1) Pull trước khi code, (2) Commit nhỏ và thường xuyên, (3) Dùng feature branches. Và quan trọng nhất: Don't panic!</p>
        `
    }
];