from flask import Flask, request, render_template
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
conn = psycopg2.connect(
    host=os.getenv('host'),
    database=os.getenv('database'),
    user=os.getenv('user'),
    password=os.getenv('password')
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/storeStudent')
def storeStudent():
    query = request.args

    name = request.args.get('name')
    email = request.args.get('email')
    if name == None:
        return "invalid name", 400
    cur = conn.cursor()

    #need to come back and handle failure
    cur.execute("INSERT INTO student (name, email) VALUES (%s, %s);", (name, email))
    conn.commit()
    cur.close()
    return "Success", 200
    
@app.route('/storeCourse')
def storeCourse():
    query = request.args

    name = request.args.get('name')
    courseNumber = request.args.get('number')
    department = request.args.get('department')

    if name == None or courseNumber == None or department == None or len(department) != 4:
        return "invalid inputs", 400
    cur = conn.cursor()

    #Need to first check if the department exists. If it doesn't, create an entry for it
    cur.execute("SELECT count(*) FROM department WHERE prefix=%s;", (department,))
    if(cur.fetchone()[0] == 0):
        cur.execute("INSERT INTO department prefix VALUES %s", (department,))
        conn.commit()
    
    cur.execute("SELECT id FROM department WHERE prefix=%s;", (department,))
    deptID = cur.fetchone()[0]
    
    #need to come back and handle failure
    cur.execute("INSERT INTO course VALUES (%s, %s, %s)", (name, courseNumber, department))
    conn.commit()
    cur.close()
    return "Success", 200
 
@app.route('/storeEnrollment')
def storeEnrollment():
    query = request.args

    studentID = request.args.get('studentID')
    courseNumber = request.args.get('number')
    department = request.args.get('department')

    if studentID == None or courseNumber == None or department == None or len(department) != 4:
        return "invalid inputs", 400
    cur = conn.cursor()

    cur.execute("SELECT id FROM department WHERE prefix=%s;", (department,))
    deptID = cur.fetchone()[0]
    cur.execute("SELECT id FROM course WHERE courseNumber=%s AND departmentID=%s;", (courseNumber, deptID))
    courseID = cur.fetchone()[0]

    #need to come back and handle failure
    cur.execute("INSERT INTO enrolment (studentID, courseID) VALUES (%s, %s)", (studentID, courseID))
    conn.commit()
    cur.close()
    return "Success", 200

@app.route('/removeStudent')
def removeStudent():
    query = request.args

    studentID = request.args.get('studentID')
    if studentID == None:
        return "invalid name", 400
    cur = conn.cursor()

    #need to come back and handle failure
    cur.execute("DELETE FROM student WHERE id=%s", (studentID,))
    conn.commit()
    cur.close()
    return "Success", 200

   
@app.route('/removeCourse')
def removeCourse():
    query = request.args

    courseNumber = request.args.get('number')
    department = request.args.get('department')

    if courseNumber == None or department == None or len(department) != 4:
        return "invalid inputs", 400
    cur = conn.cursor()

    cur.execute("SELECT id FROM department WHERE prefix=%s;", (department,))
    deptID=cur.fetchone()[0]
    cur.execute("SELECT id FROM course WHERE courseNumber=%s AND departmentID=%s;", (courseNumber, deptID))
    courseID=cur.fetchone()[0]

    #need to come back and handle failure
    cur.execute("DELETE FROM course WHERE id=%s", courseID)
    conn.commit()
    cur.close()
    return "Success", 200

@app.route('/removeEnrollment')
def removeEnrollment():
    query = request.args

    studentID = request.args.get('studentID')
    courseNumber = request.args.get('number')
    department = request.args.get('department')

    if studentID == None or courseNumber == None or department == None or len(department) != 4:
        return "invalid inputs", 400
    cur = conn.cursor()

    cur.execute("SELECT id FROM department WHERE prefix=%s;", (department,))
    deptID=cur.fetchone()[0]
    cur.execute("SELECT id FROM course WHERE courseNumber=%s AND departmentID=%s;", (courseNumber, deptID))
    courseID=cur.fetchone()[0]

    #need to come back and handle failure
    cur.execute("DELETE FROM enrolment WHERE studentID=%s AND courseID=%s", (studentID, courseID))
    conn.commit()
    cur.close()
    return "Success", 200

