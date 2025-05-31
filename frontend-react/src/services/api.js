
// src/services/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // Adjust if deploying elsewhere

// STUDENTS
export const addStudent = (student) => axios.post(`${BASE_URL}/students`, student);
export const getStudent = (id) => axios.get(`${BASE_URL}/students/${id}`);
export const updateStudent = (id, student) => axios.put(`${BASE_URL}/students/${id}`, student);
export const deleteStudent = (id) => axios.delete(`${BASE_URL}/students/${id}`);

// COURSES
export const addCourse = (course) => axios.post(`${BASE_URL}/courses`, course);
export const findCourse = (params) => axios.post(`${BASE_URL}/courses/find`, params);
export const updateCourse = (course) => axios.put(`${BASE_URL}/courses`, course);
export const deleteCourse = (course) => axios.delete(`${BASE_URL}/courses`, { data: course });

// ENROLLMENTS
export const addEnrollment = (enroll) => axios.post(`${BASE_URL}/enrollments`, enroll);
export const deleteEnrollment = (enroll) => axios.delete(`${BASE_URL}/enrollments`, { data: enroll });
export const getAllEnrollments = () => axios.get(`${BASE_URL}/enrollments`);
