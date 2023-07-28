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
app.use(express.static(__dirname));
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
const Mark = require('./models/marks');

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
            const posts = await Post.find().sort({unit : 1}); 
            const assignments = await Assignment.find().sort({unit : 1}); 
            res.render('teahome',{teacher : tea, subjects_handling : subs, posts, assignments})
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
  app.post('/makeass', upload.single('pdfFile'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const { name, unit, sub_id, marks, date_posted, date_submission } = req.body;
    //const sub_id = req.query.subject._id; // Extract subject_id from the query parameter

  if (!sub_id) {
    return res.status(400).send('Subject ID not provided.');
  }
    const ass_id = 'A' + randomBytes(3).toString('hex').toUpperCase();
    const assignment = new Assignment({
      ass_id: ass_id, 
      name: name, 
      sub_id: sub_id, 
      file: req.file.path, 
      unit: unit,
      marks : marks,
      date_posted : date_posted,
      date_submission : date_submission,
    });
    await assignment.save();
    res.redirect('/teahome'); 
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
app.post('/deleteass', async (req, res) => {
    const ass_id = req.query.ass_id;
    const subject_id = req.query.subject_id;
    await Assignment.findOneAndDelete({ ass_id, sub_id: subject_id });
    res.redirect('/teahome');
});

app.get('/stuhome',async(req, res) => {
    if (req.session.user_id){
        const stu = await Student.findOne({_id : req.session.user_id});
        if (stu){
        const subs = await Subject.find({class_id : stu.class_id});
        const posts = await Post.find().sort({unit : 1}); 
        const assignments = await Assignment.find().sort({unit : 1});
        res.render('stuhome',{student : stu, subjects_taken : subs, posts, assignments})
        }

    }
    else{
        res.redirect('/login')
    }
    //res.render('stuhome')
})

app.get('/makesubs', async (req, res) => {
    const { ass_id, sub_id, unit, s_id } = req.query;
    try {
      // Get the student data from the database based on the s_id
      const student = await Student.findOne({s_id : s_id });
      const assignment = await Assignment.findOne({ass_id : ass_id});
      if (!student) {
        return res.status(404).send('Student not found.');
      }
  
      // Pass the student data along with the other required data to the makesubs.ejs template
      res.render('makesubs', { assignment, student });
    } catch (error) {
      console.error('Error rendering makesubs page:', error);
      res.status(500).send('Failed to render makesubs page.');
    }
  });

  app.post('/submitass', upload.single('pdfFile'), async (req, res) => {
    const { s_id, ass_id, sub_id, unit} = req.body;
    const file = req.file.path; // Assuming the submitted file is uploaded using multer
  
    try {
      const submi_id = 'S' + randomBytes(3).toString('hex').toUpperCase();
      const submission = new Submission({
        submi_id: submi_id, // Implement your own function to generate a unique ID for submission
        s_id,
        ass_id,
        file,
        sub_id,
        unit,
        date_submitted : new Date(),
      });
  
      await submission.save();
      const mark = new Mark({
        s_id: s_id,
        ass_id : ass_id,  
        sub_id: sub_id, 
        unit: unit,
        marks : 0,
      });
      await mark.save();
  
      // Redirect to the student's home page after submission
      res.redirect('/stuhome');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      res.status(500).send('Failed to submit assignment.');
    }
  });

  app.get('/viewsubmissions', async (req, res) => {
    const { ass_id } = req.query;

    try {
        // Find the assignment details based on ass_id
        const assignment = await Assignment.findOne({ ass_id });
        if (!assignment) {
            return res.status(404).send('Assignment not found.');
        }

        // Find all submissions for the specific assignment
        const submissions = await Submission.find({ ass_id });

        res.render('viewsubmissions', { assignment, submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).send('Failed to fetch submissions.');
    }
});

app.post('/updatemarks', async (req, res) => {
    const { submi_id, marks_obtained } = req.body;

    try {
        // Find the submission based on submi_id
        const submission = await Submission.findOne({ submi_id });
        if (!submission) {
            return res.status(404).send('Submission not found.');
        }

        // Ensure the marks_obtained is within the valid range (0 to assignment.marks)
        const assignment = await Assignment.findOne({ ass_id: submission.ass_id });
        if (!assignment) {
            return res.status(404).send('Assignment not found.');
        }
        const maxMarks = assignment.marks;
        if (marks_obtained < 0 || marks_obtained > maxMarks) {
            return res.status(400).send(`Marks obtained should be between 0 and ${maxMarks}.`);
        }
        const mark = await Mark.findOne({ s_id : submission.s_id, ass_id : submission.ass_id  });
        
        // Update the marks_obtained field in the submission
        submission.marks_obtained = marks_obtained;
        mark.marks = marks_obtained;
        await submission.save();
        await mark.save();

        res.redirect('/teahome');
    } catch (error) {
        console.error('Error updating marks:', error);
        res.status(500).send('Failed to update marks.');
    }
});

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