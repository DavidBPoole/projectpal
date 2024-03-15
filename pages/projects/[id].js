/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Button from 'react-bootstrap/Button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSingleProject } from '../../utils/data/ProjectData';
import TaskCard from '../../components/TaskCard';
import { getTasks } from '../../utils/data/TaskData';
import TaskSearchBar from '../../components/TaskSearchBar';
import { useAuth } from '../../utils/context/authContext';

const ProjectDetails = () => {
  const [project, setProject] = useState();
  const router = useRouter();
  const { user } = useAuth();
  const { id: projectId } = router.query;

  const fetchProjectDetails = async () => {
    try {
      if (projectId) {
        const [projectData, tasksData] = await Promise.all([
          getSingleProject(projectId),
          getTasks(projectId),
        ]);

        const projectWithTasks = {
          ...projectData,
          tasks: tasksData || [],
        };

        setProject(projectWithTasks);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (projectId !== undefined) {
        await fetchProjectDetails();
      }
    };

    fetchData();
  }, [projectId]);

  const formatDueDate = (dueDate) => {
    // Format "YYYY-MM-DD"
    const [year, month, day] = dueDate.split('-');
    return `${month}/${day}/${year}`;
  };

  return (
    <>
      <Head>
        <title>ProjectTasks</title>
      </Head>
      <div>
        {project ? (
          <div>
            <h1>{project.name}</h1>
            <h2><b>ID#:</b> <b>{project.id}</b></h2>
            <p><b>Description:</b> {project.description}</p>
            <p><b>Due Date:</b> {formatDueDate(project.due_date)}</p>
            <p><b>Status:</b> {project.status}</p>
            <p><b>Collaborators:</b> {project.collaborators.map((collaborator, index) => {
              if (index === project.collaborators.length - 1) {
                return collaborator.user.name;
              }
              return `${collaborator.user.name}, `;
            })}
            </p>
            <h2>Tasks</h2>
            <Link href={`/tasks/new?projectId=${project.id}`} passHref>
              <Button style={{ marginBottom: 10 }} variant="primary" as="a">
                Add Task
              </Button>
            </Link>
            <TaskSearchBar projectId={projectId} />
            {project.tasks.map((taskObj) => (
              <TaskCard
                key={taskObj.id}
                taskObj={taskObj}
                projectId={projectId}
                currentUser={user}
                refreshPage={fetchProjectDetails}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
};
export default ProjectDetails;
