import React, { useState, useEffect } from 'react';
import {
  Container, CssBaseline, AppBar, Toolbar, Typography, Box, Paper, Tabs, Tab,
  TextField, Button, Grid, Alert, List, ListItem, ListItemText, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Keep if you plan to use it more directly
import RefreshIcon from '@mui/icons-material/Refresh';
import * as api from './services/api'; // Assuming api.js is in src/services/

// Helper TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  // --- Global Message/Error States (optional, or keep them sectional) ---
  // const [globalMessage, setGlobalMessage] = useState(null);
  // const [globalError, setGlobalError] = useState(null);

  // --- Student Section States & Handlers ---
  const [studentData, setStudentData] = useState({ name: '', email: '' });
  const [studentId, setStudentId] = useState('');
  const [studentMessage, setStudentMessage] = useState(null);
  const [studentError, setStudentError] = useState(null);
  const [fetchedStudent, setFetchedStudent] = useState(null);

  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };
  const handleStudentIdChange = (e) => {
    setStudentId(e.target.value);
  };
  const clearStudentMessages = () => {
    setStudentMessage(null);
    setStudentError(null);
    setFetchedStudent(null);
  };
  const handleAddStudent = async () => {
    clearStudentMessages();
    try {
      const response = await api.addStudent(studentData);
      setStudentMessage(`Student added! ${response.data}`);
      setStudentData({ name: '', email: '' });
    } catch (err) {
      setStudentError(err.response?.data || "Failed to add student.");
    }
  };
  const handleGetStudent = async () => {
    clearStudentMessages();
    if (!studentId) {
      setStudentError("Please enter a Student ID.");
      return;
    }
    try {
      const response = await api.getStudent(studentId);
      setFetchedStudent(response.data);
      setStudentMessage("Student fetched successfully.");
    } catch (err) {
      setStudentError(err.response?.data || "Failed to fetch student.");
    }
  };
  const handleUpdateStudent = async () => {
    clearStudentMessages();
    if (!studentId) {
      setStudentError("Please enter a Student ID to update.");
      return;
    }
    try {
      await api.updateStudent(studentId, studentData);
      setStudentMessage("Student updated successfully.");
      setStudentData({ name: '', email: '' }); // Clear form
    } catch (err) {
      setStudentError(err.response?.data || "Failed to update student.");
    }
  };
  const handleDeleteStudent = async () => {
    clearStudentMessages();
    if (!studentId) {
      setStudentError("Please enter a Student ID to delete.");
      return;
    }
    try {
      await api.deleteStudent(studentId);
      setStudentMessage("Student deleted successfully.");
      setStudentId('');
    } catch (err) {
      setStudentError(err.response?.data || "Failed to delete student.");
    }
  };

  // --- Course Section States & Handlers ---
  const [courseData, setCourseData] = useState({ name: '', number: '', department: '' });
  const [courseFindParams, setCourseFindParams] = useState({ number: '', department: '' });
  const [courseMessage, setCourseMessage] = useState(null);
  const [courseError, setCourseError] = useState(null);
  const [fetchedCourse, setFetchedCourse] = useState(null);

  const handleCourseChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };
  const handleCourseFindParamsChange = (e) => {
    setCourseFindParams({ ...courseFindParams, [e.target.name]: e.target.value });
  };
  const clearCourseMessages = () => {
    setCourseMessage(null);
    setCourseError(null);
    setFetchedCourse(null);
  };
  const handleAddCourse = async () => {
    clearCourseMessages();
    if (courseData.department.length !== 4) {
        setCourseError("Department prefix must be 4 characters.");
        return;
    }
    try {
      const response = await api.addCourse(courseData);
      setCourseMessage(response.data);
      setCourseData({ name: '', number: '', department: '' });
    } catch (err) {
      setCourseError(err.response?.data || "Failed to add course.");
    }
  };
  const handleFindCourse = async () => {
    clearCourseMessages();
    if (courseFindParams.department.length !== 4) {
        setCourseError("Department prefix for finding must be 4 characters.");
        return;
    }
    if (!courseFindParams.number || !courseFindParams.department) {
        setCourseError("Course Number and Department are required to find.");
        return;
    }
    try {
      const response = await api.findCourse(courseFindParams);
      setFetchedCourse(response.data);
      setCourseMessage("Course fetched successfully.");
    } catch (err) {
      setCourseError(err.response?.data || "Failed to find course.");
    }
  };
  const handleUpdateCourse = async () => {
    clearCourseMessages();
    if (!courseData.name || !courseFindParams.number || !courseFindParams.department) {
        setCourseError("New Course Name, and current Course Number & Department are required to update.");
        return;
    }
    if (courseFindParams.department.length !== 4) {
        setCourseError("Department prefix for updating must be 4 characters.");
        return;
    }
    try {
      const payload = {
        name: courseData.name,
        number: courseFindParams.number,
        department: courseFindParams.department
      };
      const response = await api.updateCourse(payload);
      setCourseMessage(response.data);
      setCourseData({ name: '', number: '', department: '' }); // Clear main form
      setCourseFindParams({ number: '', department: '' }); // Clear find form
    } catch (err) {
      setCourseError(err.response?.data || "Failed to update course.");
    }
  };
  const handleDeleteCourse = async () => {
    clearCourseMessages();
    if (!courseFindParams.number || !courseFindParams.department) {
        setCourseError("Course Number and Department are required to delete.");
        return;
    }
    if (courseFindParams.department.length !== 4) {
        setCourseError("Department prefix for deleting must be 4 characters.");
        return;
    }
    try {
      const response = await api.deleteCourse(courseFindParams);
      setCourseMessage(response.data);
      setCourseFindParams({ number: '', department: '' });
    } catch (err) {
      setCourseError(err.response?.data || "Failed to delete course.");
    }
  };

  // --- Enrollment Section States & Handlers ---
  const [enrollmentData, setEnrollmentData] = useState({ studentID: '', number: '', department: '' });
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentMessage, setEnrollmentMessage] = useState(null);
  const [enrollmentError, setEnrollmentError] = useState(null);

  const fetchEnrollments = async () => {
    try {
      const response = await api.getAllEnrollments();
      setEnrollments(response.data.enrollments || []);
      setEnrollmentMessage("Enrollments refreshed.");
      setEnrollmentError(null);
    } catch (err) {
      setEnrollmentError(err.response?.data?.message || err.response?.data || "Failed to fetch enrollments.");
      setEnrollments([]);
    }
  };
  useEffect(() => { // Fetch enrollments when tab is active or component mounts
    if (tabValue === 2) { // Assuming Enrollment tab is index 2
      fetchEnrollments();
    }
  }, [tabValue]); // Re-fetch if tab changes to enrollments

  const handleEnrollmentChange = (e) => {
    setEnrollmentData({ ...enrollmentData, [e.target.name]: e.target.value });
  };
  const clearEnrollmentMessages = () => {
    setEnrollmentMessage(null);
    setEnrollmentError(null);
  };
  const handleAddEnrollment = async () => {
    clearEnrollmentMessages();
    if (enrollmentData.department.length !== 4) {
        setEnrollmentError("Department prefix must be 4 characters.");
        return;
    }
    if (!enrollmentData.studentID || !enrollmentData.number || !enrollmentData.department) {
         setEnrollmentError("All fields are required to add enrollment.");
        return;
    }
    try {
      const response = await api.addEnrollment(enrollmentData);
      setEnrollmentMessage(response.data);
      setEnrollmentData({ studentID: '', number: '', department: '' });
      fetchEnrollments();
    } catch (err) {
      setEnrollmentError(err.response?.data || "Failed to add enrollment.");
    }
  };
  const handleDeleteEnrollment = async () => {
    clearEnrollmentMessages();
     if (!enrollmentData.studentID || !enrollmentData.number || !enrollmentData.department) {
         setEnrollmentError("All fields (Student ID, Course Number, Department) are required to delete an enrollment.");
        return;
    }
    if (enrollmentData.department.length !== 4) {
        setEnrollmentError("Department prefix for delete must be 4 characters.");
        return;
    }
    try {
      const response = await api.deleteEnrollment(enrollmentData); // Using current form data
      setEnrollmentMessage(response.data);
      setEnrollmentData({ studentID: '', number: '', department: '' }); // Clear form
      fetchEnrollments();
    } catch (err) {
      setEnrollmentError(err.response?.data || "Failed to delete enrollment.");
    }
  };


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Clear messages when switching tabs
    clearStudentMessages();
    clearCourseMessages();
    clearEnrollmentMessages();
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student & Course Management
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 2, mb: 4 }}> {/* Reduced top margin */}
        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="management sections" centered>
              <Tab label="Students" {...a11yProps(0)} />
              <Tab label="Courses" {...a11yProps(1)} />
              <Tab label="Enrollments" {...a11yProps(2)} />
            </Tabs>
          </Box>

          {/* Student Section Panel */}
          <TabPanel value={tabValue} index={0}>
            <Box>
              <Typography variant="h5" gutterBottom>Manage Students</Typography>
              {studentMessage && <Alert severity="success" onClose={() => setStudentMessage(null)} sx={{ mb: 2 }}>{studentMessage}</Alert>}
              {studentError && <Alert severity="error" onClose={() => setStudentError(null)} sx={{ mb: 2 }}>{studentError}</Alert>}

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Add Student / New Info for Update</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Name" name="name" value={studentData.name} onChange={handleStudentChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" name="email" value={studentData.email} onChange={handleStudentChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={handleAddStudent} sx={{ mr: 1 }}>Add Student</Button>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Find, Update, or Delete Student by ID</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Student ID" value={studentId} onChange={handleStudentIdChange} />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Button variant="outlined" onClick={handleGetStudent} sx={{ mr: 1, mb: {xs: 1, sm:0} }}>Get Student</Button>
                    <Button variant="contained" color="primary" onClick={handleUpdateStudent} sx={{ mr: 1, mb: {xs: 1, sm:0} }}>Update (uses fields above)</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteStudent} sx={{ mb: {xs: 1, sm:0} }}>Delete Student</Button>
                  </Grid>
                </Grid>
                {fetchedStudent && (
                  <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                    <Typography variant="subtitle1">Fetched Student Details:</Typography>
                    <Typography>Name: {fetchedStudent.name}</Typography>
                    <Typography>Email: {fetchedStudent.email}</Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </TabPanel>

          {/* Course Section Panel */}
          <TabPanel value={tabValue} index={1}>
            <Box>
              <Typography variant="h5" gutterBottom>Manage Courses</Typography>
              {courseMessage && <Alert severity="success" onClose={() => setCourseMessage(null)} sx={{ mb: 2 }}>{courseMessage}</Alert>}
              {courseError && <Alert severity="error" onClose={() => setCourseError(null)} sx={{ mb: 2 }}>{courseError}</Alert>}

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Add Course / New Name for Update</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField fullWidth label="Course Name" name="name" value={courseData.name} onChange={handleCourseChange} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="Course Number (e.g., 101)" name="number" value={courseData.number} onChange={handleCourseChange} helperText="For Add only"/>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Department (4 chars)" name="department" value={courseData.department} onChange={handleCourseChange} inputProps={{ maxLength: 4 }} helperText="For Add only"/>
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={handleAddCourse}>Add Course</Button>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Find, Update, or Delete Course</Typography>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Course No. (Identifier)" name="number" value={courseFindParams.number} onChange={handleCourseFindParamsChange} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Department (Identifier)" name="department" value={courseFindParams.department} onChange={handleCourseFindParamsChange} inputProps={{ maxLength: 4 }}/>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: {xs: 1, sm: '16px'} }}>
                      <Button variant="outlined" onClick={handleFindCourse} >Find Course</Button>
                      <Button variant="contained" color="primary" onClick={handleUpdateCourse} >Update Name (uses name field above)</Button>
                      <Button variant="contained" color="error" onClick={handleDeleteCourse} >Delete Course</Button>
                  </Grid>
                </Grid>
                {fetchedCourse && (
                  <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                    <Typography variant="subtitle1">Fetched Course Details:</Typography>
                    <Typography>Name: {fetchedCourse.name}</Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </TabPanel>

          {/* Enrollment Section Panel */}
          <TabPanel value={tabValue} index={2}>
             <Box>
              <Typography variant="h5" gutterBottom>Manage Enrollments</Typography>
              {enrollmentMessage && <Alert severity="success" onClose={() => setEnrollmentMessage(null)} sx={{ mb: 2 }}>{enrollmentMessage}</Alert>}
              {enrollmentError && <Alert severity="error" onClose={() => setEnrollmentError(null)} sx={{ mb: 2 }}>{enrollmentError}</Alert>}

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Add/Delete Enrollment</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="Student ID" name="studentID" value={enrollmentData.studentID} onChange={handleEnrollmentChange} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="Course Number" name="number" value={enrollmentData.number} onChange={handleEnrollmentChange} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="Department (4 chars)" name="department" value={enrollmentData.department} onChange={handleEnrollmentChange} inputProps={{ maxLength: 4 }} />
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: {xs: 'row', sm:'column'}, gap: 1 }}>
                    <Button fullWidth variant="contained" onClick={handleAddEnrollment}>Add</Button>
                    <Button fullWidth variant="contained" color="error" onClick={handleDeleteEnrollment}>Delete</Button>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                    <Typography variant="h6" gutterBottom>Current Enrollments</Typography>
                    <IconButton onClick={fetchEnrollments} color="primary" aria-label="refresh enrollments">
                        <RefreshIcon />
                    </IconButton>
                </Box>
                {enrollments.length > 0 ? (
                  <List dense>
                    {enrollments.map((enroll, index) => (
                      <React.Fragment key={`<span class="math-inline">\{enroll\.studentID\}\-</span>{enroll.courseID}-${index}`}> {/* Ensure unique key */}
                        <ListItem>
                          <ListItemText
                            primary={`Student ID: ${enroll.studentID} - Course ID: ${enroll.courseID}`}
                          />
                        </ListItem>
                        {index < enrollments.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography>No enrollments found or could not load them.</Typography>
                )}
              </Paper>
            </Box>
          </TabPanel>

        </Paper>
      </Container>
    </>
  );
}

export default App;
