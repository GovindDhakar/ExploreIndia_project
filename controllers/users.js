const User = require('../model/user');


module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Successfully registered, Welcome to ExploreIndia')
            res.redirect('/destinations')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/destinations')
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back')
    const redirectUrl = req.session.returnToUrl || '/destinations'
    delete req.session.returnToUrl
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged Out')
    res.redirect('/destinations')
}