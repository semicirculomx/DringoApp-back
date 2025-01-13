import User from '../../models/User.js'

let createCustomer = async (req, res, next) => {
    console.log(req.body)
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
    try {
        await User.create(req.body);
        return res.status(201).json({
            success: true,
            message: "Usuario creado!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error creando al usuario'
        });
    }
}

export default createCustomer;
