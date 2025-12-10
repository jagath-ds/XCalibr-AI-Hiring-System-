import datetime
from typing import List, Optional

from sqlalchemy import Integer, String, Text, DateTime, func, ForeignKey,Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from sqlalchemy.dialects.postgresql import INET


class Candidates(Base):
    __tablename__="candidate"

    candid : Mapped[int] = mapped_column(Integer, primary_key=True,autoincrement=True)
    firstname: Mapped[str] = mapped_column(String(50), nullable=False)
    lastname: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    pass_word: Mapped[str] = mapped_column(String(255),nullable=False)
    contactinfo: Mapped[str] = mapped_column(String(20),nullable=True)
    resumelink: Mapped[str] = mapped_column(String(255),nullable=True)
    github_link: Mapped[str] = mapped_column(String(255),nullable=True)
    sop_link: Mapped[str] = mapped_column(String(255),nullable=True)
    linkedin_link: Mapped[str] = mapped_column(String(255),nullable=True)
    leetcode_link: Mapped[str] = mapped_column(String(255),nullable=True)
    linkedin_pdf_link: Mapped[str] = mapped_column(String(255), nullable=True)
    dateregistered: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.current_timestamp())
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")

    current_title: Mapped[str] = mapped_column(String(100), nullable=True)
    years_of_experience: Mapped[str] = mapped_column(String(50), nullable=True)
    professional_summary: Mapped[str] = mapped_column(Text, nullable=True)
    skills: Mapped[str] = mapped_column(Text, nullable=True)
    
    analysis_reports: Mapped[list["Analysis"]] = relationship("Analysis",back_populates="candidate")
    feed: Mapped[list["Feedback"]] = relationship("Feedback",back_populates= "cand")
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")

class Hr(Base):
    __tablename__="hr"

    hr_id: Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    firstname: Mapped[str] = mapped_column(String(50),nullable=False)
    lastname: Mapped[str] = mapped_column(String(50),nullable=False)
    email: Mapped[str] = mapped_column(String(100),nullable=False,unique=True)
    pass_word: Mapped[str] = mapped_column(String(255),nullable=False)
    designation: Mapped[str] = mapped_column(String(50),nullable=True)
    permissions: Mapped[str] = mapped_column(String(50),nullable=True)
    jobpost : Mapped[list["JobPosting"]] = relationship("JobPosting",back_populates="hr")
    # NEW: Added for easy look-up of feedback sent by this HR
    feedback_sent: Mapped[list["Feedback"]] = relationship("Feedback", back_populates="sender")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")

class Admin(Base):
    __tablename__ ="admin_user"

    adminid: Mapped[int]= mapped_column(Integer,primary_key=True,autoincrement=True)
    firstname: Mapped[str] = mapped_column(String(50),nullable=False)
    lastname: Mapped[str] = mapped_column(String(50),nullable=False)
    email: Mapped[str] = mapped_column(String(100),nullable=False,unique=True)
    pass_word: Mapped[str] = mapped_column(String(255),nullable=False)
    organization: Mapped[str] = mapped_column(String(150),nullable=True)
    permissions: Mapped[str] = mapped_column(String(50),nullable=True)

    system: Mapped["SystemLog"] = relationship("SystemLog",back_populates="admin")
    
class Analysis(Base):
    __tablename__="analysis_report"

    reportid: Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    candid: Mapped[int] = mapped_column(Integer,ForeignKey("candidate.candid"),nullable=False)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_posting.job_id"), nullable=False)
    application_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("application.application_id"), nullable=True, unique=True)
    trustscore: Mapped[Optional[int]] = mapped_column(Integer,nullable=True)
    careerscore: Mapped[Optional[int]] = mapped_column(Integer,nullable=True)
    githubscore: Mapped[Optional[int]] = mapped_column(Integer,nullable=True)
    linkedinscore: Mapped[Optional[int]] = mapped_column(Integer,nullable=True)
    leetcodescore: Mapped[Optional[int]] = mapped_column(Integer,nullable=True)
    jd_match_score: Mapped[Optional[int]] = mapped_column(Integer,nullable=True)
    overall_score: Mapped[Optional[int]] = mapped_column(Integer,nullable=True)
    total_possible_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) 
    remarks: Mapped[Optional[str]] = mapped_column(Text,nullable=True) 
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reportcardlink: Mapped[Optional[str]] = mapped_column(String(255),nullable=True) 
    analysis_status: Mapped[str] = mapped_column(String(20), default="Pending")
    analyzed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    application: Mapped["Application"] = relationship("Application", back_populates="analysis")
    candidate : Mapped["Candidates"] = relationship("Candidates", back_populates="analysis_reports")
    job: Mapped["JobPosting"] = relationship("JobPosting", back_populates="analysis_reports")
    feed: Mapped[list["Feedback"]] = relationship("Feedback", back_populates = "report")

class Feedback(Base):
    __tablename__="feedback"

    feedbackid : Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    candid: Mapped[int] = mapped_column(Integer,ForeignKey("candidate.candid"),nullable=False)
    hr_id: Mapped[int] = mapped_column(Integer,ForeignKey("hr.hr_id"),nullable=False) 
    reportid: Mapped[Optional[int]] = mapped_column(Integer,ForeignKey("analysis_report.reportid"),nullable=True)
    content: Mapped[str] = mapped_column(Text,nullable=False) 
    message_type: Mapped[str] = mapped_column(String(50),nullable=False, default="General")
    sent_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.current_timestamp())

    cand : Mapped["Candidates"] = relationship("Candidates", back_populates="feed")
    report: Mapped[Optional["Analysis"]] = relationship("Analysis", back_populates="feed")
    sender: Mapped["Hr"] = relationship("Hr", back_populates="feedback_sent") 

class SystemLog(Base):
    __tablename__ = "system_log"

    logid : Mapped[int] = mapped_column(Integer,autoincrement=True,primary_key=True)
    adminid : Mapped[int] = mapped_column(Integer,ForeignKey("admin_user.adminid"),nullable=True)
    actiontype: Mapped[str] = mapped_column(String(50),nullable=False)
    actiondescription : Mapped[str] = mapped_column(Text,nullable=True)
    affectedtable : Mapped[str] = mapped_column(String(50),nullable=True)
    
    # --- FIX ---
    timestamped : Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.current_timestamp())
    
    ip_address : Mapped[str] = mapped_column(INET,nullable= True)
    status : Mapped[str] = mapped_column(String(20),nullable=True)

    admin : Mapped["Admin"] = relationship("Admin",back_populates="system")

class JobPosting(Base):
    __tablename__ = "job_posting"

    job_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hr_id: Mapped[int] = mapped_column(Integer, ForeignKey("hr.hr_id"), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    company_name: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    salary_range: Mapped[str] = mapped_column(String(50), nullable=True)
    employment_type: Mapped[str] = mapped_column(String(50), nullable=True) 
    analyze_github: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    analyze_leetcode: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    analyze_linkedin: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    date_posted: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.current_timestamp())
    
    deadline: Mapped[DateTime] = mapped_column(DateTime, nullable=True) 
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="Active")

    hr: Mapped["Hr"] = relationship("Hr",back_populates="jobpost")
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    analysis_reports: Mapped[list["Analysis"]] = relationship("Analysis", back_populates="job")

class Application(Base):
    __tablename__ = "application"

    application_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    candid: Mapped[int] = mapped_column(ForeignKey("candidate.candid"), nullable=False)
    job_id: Mapped[int] = mapped_column(ForeignKey("job_posting.job_id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="Applied")
    cv_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # --- FIX ---
    applied_on: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.current_timestamp())

    
    candidate: Mapped["Candidates"] = relationship("Candidates", back_populates="applications")
    job: Mapped["JobPosting"] = relationship("JobPosting", back_populates="applications")
    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="application", uselist=False, cascade="all, delete-orphan")