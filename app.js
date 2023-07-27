const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { randomBytes } = require('crypto');

mongoose.connect('mongodb://localhost:27023/coursexcel',{

    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});

app.use(express.urlencoded({extended : true}));
app.use(session({
    secret: 'your secret', // Replace with a strong secret for production
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        httpOnly: false, // Set to true for security in production
        path: '/' // Set the appropriate path for your use case
    }
}));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads'); // Store the uploaded files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

const upload = multer({ storage: storage });

app.get('/',(req, res) => {
    res.render('home')
})

app.get('/signup',(req, res) => {
    res.render('signup')
})
const Student = require('./models/student');
const Teacher = require('./models/teacher');
const Subject = require('./models/subject');
const Post = require('./models/post');
const Assignment = require('./models/assignment');
const Submission = require('./models/submission');
const subject = require('./models/subject');

app.post('/signup', async (req, res) => {
    const pss = req.body.password1;
    const password = await bcrypt.hash(pss,12);
    
    const name = req.body.name;
    const email = req.body.email;
    if (req.body.category == 'Student'){
        const s_id = req.body.s_id;
        const class_id = req.body.classid;
        const stu = new Student({
            s_id,
            name,
            email,
            password,
            class_id

        });
        await stu.save();
        res.redirect('/login');
    }
    if (req.body.category == 'Teacher'){
        const t_id = req.body.t_id;
        const tea = new Teacher({
            t_id,
            name,
            email,
            password
        })
        await tea.save();
        res.redirect('/login');
    }
})

app.get('/login',(req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    if (req.body.category == 'Student'){
        const stu = await Student.findOne({email});
        const validpassword = await bcrypt.compare(password,stu.password);
        if (validpassword){
            req.session.user_id = stu._id;
            res.redirect('/stuhome')
        }
        else{
            res.redirect('/login')
        }
    }
    if (req.body.category == 'Teacher'){
        const tea = await Teacher.findOne({email:email});
        const validpassword = await bcrypt.compare(password,tea.password);
        if (validpassword){
            req.session.user_id = tea._id;
            console.log(req.session.user_id);
            res.redirect('/teahome')
        }
        else{
            res.redirect('/login')
        }
    }
})

app.get('/teahome', async(req, res) => {
    if (req.session.user_id){
        const tea = await Teacher.findOne({_id : req.session.user_id});
        if (tea){
            const subs = await Subject.find({t_id : tea.t_id});
            const posts = await Post.find(); 
            console.log(posts);
            res.render('teahome',{teacher : tea, subjects_handling : subs, posts})
        }
    }
    else{
        res.redirect('/login')
    }
    //res.render('teahome')
})

app.get('/teapost', async(req, res) => {
    const subjectId = req.query.subject_id;

  // Fetch the subject details based on subjectId
  const subject = await Subject.findOne({ sub_id: subjectId });

  if (!subject) {
    return res.status(404).send('Subject not found.');
  }

  res.render('teapost', { subject });
  });
  app.get('/makeass', async(req, res) => {
    const subjectId = req.query.subject_id;

  // Fetch the subject details based on subjectId
  const subject = await Subject.findOne({ sub_id: subjectId });

  if (!subject) {
    return res.status(404).send('Subject not found.');
  }

  res.render('makeass', { subject });
  });
  app.post('/teapost', upload.single('pdfFile'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const { name, unit, sub_id } = req.body;
    //const sub_id = req.query.subject._id; // Extract subject_id from the query parameter

  if (!sub_id) {
    return res.status(400).send('Subject ID not provided.');
  }
    const post_id = 'P' + randomBytes(3).toString('hex').toUpperCase();
    const post = new Post({
      post_id: post_id, 
      name: name, 
      file: req.file.path, 
      sub_id: sub_id, 
      unit: unit,
    });
    await post.save();
    res.redirect('/teahome'); 
  });

  app.post('/deletepost', async (req, res) => {
    const post_id = req.query.post_id;
    const subject_id = req.query.subject_id;
    await Post.findOneAndDelete({ post_id, sub_id: subject_id });
    res.redirect('/teahome');
});

app.get('/stuhome',async(req, res) => {
    if (req.session.user_id){
        const stu = await Student.findOne({_id : req.session.user_id});
        if (stu){
        res.render('stuhome',{student : stu})
        }

    }
    else{
        res.redirect('/login')
    }
    //res.render('stuhome')
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

app.listen(3000,() => {
    console.log('Serving on port 3000!')
})