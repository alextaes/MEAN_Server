let express = require('express');
let bodyParser = require('body-parser');
let usuariosRest = require('./rest-apis/usuariosRest.js');
let productosRest = require('./rest-apis/productosRest.js');
let pedidosRest = require('./rest-apis/pedidosRest.js');
let mongooseUtil = require("./util/mongooseUtil.js");
let authUtil = require("./util/autenticacionUtil");

//Lo primero que hacemos es la llamada a conectar
mongooseUtil.conectar()
.then( arrancarExpress )
.catch( error => console.log(error));

function arrancarExpress(){

    let app = express();

    app.disable('x-powered-by');

    //Interceptor:
    app.use(function( request, response, next){
        console.log("Petición recibida:"+request.path);
        
        //Para el cross origin:
        //Incluye configuración para BASIC AUTHENTICATION
        response.header("Access-Control-Allow-Origin", "*");
        response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        console.log("METODO:"+request.method);
        if( request.method == 'OPTIONS'){
            next();
            return;
        }

        //Si la peticion es para darse de alta como usuario
        //hacemos la excepción y no comprobamos la autenticacion
        if( (request.method == 'POST' && request.url=='/usuarios')) {
            next();
            return;
        }

        authUtil.basicAuthentication(request, response)
        .then( usuario => {
            //guardamos el usuario en el request
            request.usuario = usuario; 
            next(); 
        })
        .catch( error => {
            response.sendStatus(403);
        });

    });

    app.use(bodyParser.json());
    app.use('/', usuariosRest.router);
    app.use('/', productosRest.router);
    app.use('/', pedidosRest.router);

    app.listen(8000, function(){ 
        console.log('Esperando peticiones...');
    });
}
