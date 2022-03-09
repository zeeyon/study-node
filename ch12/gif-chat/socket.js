// 웹 소켓 로직이 들어있음
const SocketIO = require('socket.io');

module.exports = (server, app) => {
    const io = new SocketIO(server, { path: '/socket.io' }); // socket.io를 불러와 express와 연결
                                                             // SocketIO의 두 번째 인수로 옵션 객체를 넣어 서버에 관한 여러가지 설정 가능
                                                             // path: 클라이언트가 접속할 경로 설정(클라이언트에서도 이 경로와 일치하는 path를 넣어야 함)
    app.set('io', io); // 라우터에서 io 객체를 쓸 수 있게 저장, req.app.get('io')로 접근 가능
    const room = io.of('/room'); // of 메서드: Socket.IO에 다른 네임스페이스를 부여하는 메서드, 같은 네임스페이스끼리만 데이터 전달
    const chat = io.of('/chat');

    // 웹 소켓 연결 후 이벤트 리스너를 붙힘
    // io(room, chat)와 socket객체가 Socket.IO의 핵심임

    // room 네임스페이스
    room.on('connection', (socket) => { // 이벤트리스너를 붙혀줌
                                        // connection: 클라이언트가 접속했을 때 발생, 콜백으로 소켓 객체(socket) 제공
        console.log('room 네임스페이스에 접속');
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 접속 해제');
        });
    });

    // chat 네임스페이스
    chat.on('connection', (socket) => { // 이벤트리스너를 붙혀줌
        console.log('chat 네임스페이스에 접속');
        const req = socket.request;
        const { headers: { referer }} = req; // socket.request.headers.referer: 현재 웹 페이지의 URL 가져올 수 있음, referer: 하이퍼링크를 통해서 각각의 사이트로 방문시 남는 흔적
        const roomId = referer // roomId로 같은 채팅방에 있는 사람인지 구분
            .split('/')[referer.split('/').length -1]
            .replace(/\?.+/, ''); // split과 replace로 방의 id를 가져옴
            socket.join(roomId); // 방의 id를 인수로 받음
                                 //  chat 네임스페이스에 접속 시 socket.join 메소드 실행 - 방에 들어가는 메서드

            socket.on('disconnect', () => {
                console.log('chat 네임스페이스 접속 해제');
                socket.leave(roomId); // chat 네임스페이스에 접속 해제 시 socket.join 메소드 실행 - 방에서 나가는 메서드
                                      // 연결이 끊기면 자동으로 방에서 나가지만, 확실히 하기 위해 추가
            });
    });
};
//         // 웹 소켓 연결 후 이벤트 리스너를 붙힘
//         // io와 socket객체가 Socket.IO의 핵심임
//         io.on('connection', (socket) => { // connection: 클라이언트가 접속했을 때 발생, 콜백으로 소켓 객체(socket) 제공
//         const req = socket.request; // socket.request: "요청" 객체에 접근 가능, socket.request.res: "응답" 객체에 접근 가능

//         const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;// req.headers['x-forwarded-for'] || req.connection.remoteAddress: 클라이언트의 IP를 알아내는 유명한 방법 중 하나
//                                                                                   // express에서는 IP 확인 시 proxy-addr 패키지를 사용하므로 이 패키지(proxy-addr) 사용해도 괜찮음
//                                                                                   // localhost 접속 시 크롬에서 IP가 ::1로 뜸, 다른 브라우저는 ::1외에 다른 IP가 뜰 수 있음

//         console.log('새로운 클라이언트 접속', ip, socket.id, req.ip); // socket.id: 소켓의 고유 아이디(소켓 주인이 누군지 특정 가능) 가져옴
//         socket.on('disconnect', () => { // 연결 종료 시
//             console.log('클라이언트 접속 해제', ip, socket.id);
//             clearInterval(socket.interval);
//         });
//         socket.on('error', (error) => { // 에러 시
//             console.error(error);
//         });
//         socket.on('reply', (data) => { // 사용자가 직접 만든 이벤트(views/index.html), 클라이언트로부터 메시지 수신 시
//                                        // reply라는 이벤트명으로 데이터를 보낼 때 서버에서 받는 부분
//             console.log(data);
//         });

//         socket.interval = setInterval(() => { // 3초마다 클라이언트로 메시지 전송
//            socket.emit('news', 'Hello Socket.IO'); // emit 메서드 첫 번째 인수: 이벤트 이름, 두 번째 인수: 데이터 
//                                                    // 클라이언트가 이 메시지를 받으려면 클라이언트에 news 이벤트 리스너를 만들어야 함 
//         }, 3000); 
//     });
// };