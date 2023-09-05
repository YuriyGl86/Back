const fs = require('fs');
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body').default;
const uuid = require('uuid');
const cors = require('@koa/cors');



const app = new Koa();

let tickets = [];
tickets.push({
  id: '1',
  name: 'тестовый тикет с сервера',
  description: 'это первая тестовая заявка, она создана на сервере',
  status: false,
  created: Date.now()
})

tickets.push({
  id: '2',
  name: 'второй тестовый тикет с сервера',
  description: 'это вторая тестовая заявка, она создана на сервере',
  status: false,
  created: Date.now()
})

app.use(cors());

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    next();

    return;
  }

  // ctx.response.set('Access-Control-Allow-Origin', '*');

  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');

  ctx.response.status = 204;
});


app.use((ctx, next) => {
  if (ctx.request.method !== 'POST') {
    next();

    return;
  }

  console.log(ctx.request.body);

  const { name, description, status } = ctx.request.body;
  const id = uuid.v4()
  const created  = Date.now()

  const newTicket = { id, name, description, status, created }
  tickets.push(newTicket);

  ctx.response.body = newTicket;

  next();
});

app.use((ctx, next) => {
  if (ctx.request.method !== 'DELETE') {
    next();

    return;
  }
  
  const { id } = ctx.request.query;
  console.log(id)
  console.log(tickets)

  ctx.response.set('Access-Control-Allow-Origin', '*');

  tickets = tickets.filter(ticket => ticket.id !== id);

  ctx.response.body = 'OK';
  console.log(tickets)

  next();
});

app.use(async (ctx, next) => {
  if (ctx.request.method !== 'GET') {
    next();

    return;
  }
  // console.log(ctx.request.query)
  const { method } = ctx.request.query;
  // console.log(method)
  switch (method) {
      case 'allTickets':
          ctx.response.body = tickets;
          next()
          return;
      // TODO: обработка остальных методов
      case 'ticketById':
        const { id } = ctx.request.query
        const ticket = tickets.find(elem => elem.id == id)
        ctx.response.body = ticket
        console.log(ticket)
        next()
        return
      default:
          ctx.response.status = 404;
          return;
  }
});

app.use(async (ctx, next) => {
  if (ctx.request.method !== 'PATCH') {
    next();

    return;
  }
  console.log(ctx.request.query)
  const { id } = ctx.request.query;
  const ticket = tickets.find(elem => elem.id == id)
  console.log(ticket)
  ticket.status = ticket.status? false: true;
  ctx.response.body = `status chenged to ${ticket.status}`
  next()
});








const server = http.createServer(app.callback());

const port = 7071;

server.listen(port, (err) => {
  if (err) {
    console.log(err);

    return;
  }

  console.log('Server is listening to ' + port);
});