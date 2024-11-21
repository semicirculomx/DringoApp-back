import bcryptjs from 'bcryptjs';

function passwordIsOk(req, res, next){
    const db_pass = req.user.password
    const form_pass = req.body.password
    if(bcryptjs.compareSync(form_pass, db_pass)){
        return next()
    }
    console.log(db_pass)
    console.log(form_pass)
    return res.status(400).json({
        succes: false,
        message: [{
            path: 'credentials',
            message: 'malic credentials'
        }]
    });
}

export default passwordIsOk;