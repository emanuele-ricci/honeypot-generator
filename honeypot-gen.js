
const fs = require('fs');
const readline = require('readline');

const options = {
  route:{pos:'',val:''},
  addr:{pos:'',val:''},
  save:{pos:'',val:''}
};

for (let key in options) {
  if(typeof options[key]==='boolean'){
    (process.argv.indexOf(`-${key}`)!==-1) ?  options[key] = true : options[key] = false
  }
  else{
    options[key].pos = process.argv.indexOf(`-${key}`);
    (options[key].pos!==-1) ? options[key].val = process.argv[options[key].pos + 1] : options[key].val = false
  }
};

const path = ['./nmap.assoc', 'nmap-mac-prefixes'];

const services = [ 20,21, 22, 23, 25, 80, 8080, 135, 137, 156, 161, 443, 445, 530, 655, 3389 ];

const list = [ [] , [] ];
const random_port = [];

const honeypot = {
  hyp_ip:'',
  personality:[],
  open_ports:[]
};

const route = options.route.val.split('.');
const addr = options.addr.val.split(','); 

async function Random_list() {

  for(let i=0;i<2; i++){

    let fileStream = fs.createReadStream(path[i]);
    let rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (let line of rl){
      list[i].push(line);
    }

    let random_item = list[i][Math.floor(Math.random() * (list[i].length + 1))];
    honeypot.personality.push(random_item);  

  };
  
};

function Random_port(n){

  for(let i=0;i<=Math.floor(Math.random() * 6); i++){

    let gen_random_port = services[Math.floor(Math.random() * services.length)];
    
    if(!random_port.includes(gen_random_port)){ 
      random_port.push(gen_random_port);
      honeypot.open_ports.push(`add honeypot_${n} tcp port ${gen_random_port} open`); 
    }; 
  };

};

function Template(i,honeypot){

  let active_service = honeypot.open_ports.join('\n');
  let template = `\nroute ${options.route.val} link ${honeypot.hyp_ip}/32 \ncreate honeypot_${i}\nset honeypot_${i} personality "${honeypot.personality[0]}"\nset honeypot_${i} default icmp action open\nset honeypot_${i} default tcp action filtered\nset honeypot_${i} default udp action filtered\nset honeypot_${i} ethernet "${honeypot.personality[1]}"\n${active_service}\nbind ${honeypot.hyp_ip} honeypot_${i}\n`;
  fs.appendFileSync(options.save.val, template);

};

async function generate(){

 fs.writeFileSync(options.save.val, `route entry ${options.route.val}\n\n`);  

  for(let i = 0; i<addr.length; i++){
    honeypot.hyp_ip = `${route[0]}.${route[1]}.${route[2]}.${addr[i]}`;
    Random_port(i); await Random_list(); Template(i,honeypot);
    honeypot.personality = []; honeypot.open_ports = [];
  };
  
};


generate();


















