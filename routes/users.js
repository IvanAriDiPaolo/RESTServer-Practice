//Desestructurar funciones de un paquete
const {Router} = require('express');
const {roleValidation, emailValidation, userValidation} = require('../helpers/db-validators')

const {
    usersGet,
    usersPut,
    usersPost,
    usersDelete,
    usersPatch
} = require('../controllers/users');

//Desestructuramos funcion de express validator para validar
//si el email existe, etc.
const { check } = require('express-validator');

// const { validate } = require('../middleWares/validations');
// const { validateJWT } = require('../middleWares/validateJWT');
// const { validateAdminRole, hasRoles } = require('../middleWares/validateRole');
// Estas 3 importaciones se hacen mas ordenadas asi:
const {
    validate,
    validateJWT,
    validateAdminRole,
    hasRoles,
} = require('../middleWares/index')

const router = Router();

//No estoy ejecutando la funcion usersGet, estoy enviando
//una referencia a la misma como callback que esta en controllers.
//Se le va a mandar la req y res
router.get('/', usersGet);
    // Petición Get
    //res.send('Hello World');// Se manda como text/html

router.put('/:id',[
    check('id', 'Its not a valid id').isMongoId(),
    check('id').custom(userValidation),
    validate
], usersPut);

//Hacemos la valdacion del email como middleware
//usando la funcion check
//como es un middleware se define como segundo argumento si se mandan 3 argumentos
//si se mandan 2 argumentos el segundo es el controlador
router.post('/', [
    //esto va a crear una base de errores, no va a crear el error en si
    //se lo va a pasar el error cuando se ejecute el controlador de usersPost 
    check('email', 'The email its invalid').isEmail(),
    check('email').custom(emailValidation),
    check('name', 'The name is obligatory').not().isEmpty(),
    check('password', 'The password must have at least 8 characters').isLength({min:8}),
    //Este check es si es algo preciso dentro de un array pero con el role se hace una bd diferente
    // check('role', 'The role doesnt exist. ').isIn(['ADMIN_ROLE', 'USER_ROLE']),
    check('role').custom(roleValidation),// Se podria escribir asi o  
    // check('role').custom((rol) => roleValidation(rol)), pero es lo mismo q la linea de arriba
    //Se pone el validate al final de todos los checks para q no continue a la funcion en caso
    // de que haya un error.
    validate
]

//si mandamos varios middlewares se mandan como arreglo
,usersPost);

router.delete('/:id',[
    //Se valida primero el jwt para que no siga con las validaciones si da error
    validateJWT,
    // validateAdminRole,
    hasRoles('ADMIN_ROLE', 'SELLER_ROLE'),
    check('id', 'Its not a valid id').isMongoId(),
    check('id').custom(userValidation),
    validate
], usersDelete);

router.patch('/', usersPatch);



module.exports = router;