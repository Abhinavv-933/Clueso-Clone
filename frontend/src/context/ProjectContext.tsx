"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export type ProjectType = "record" | "upload" | "slides";
export type ProjectStatus = "processing" | "ready";

export interface Project {
    id: string;
    name: string;
    type: ProjectType;
    status: ProjectStatus;
    createdAt: string; // ISO string for easier serialization
}

interface ProjectContextType {
    projects: Project[];
    addProject: (type: ProjectType) => void;
    createProject: (title: string, s3Key: string, uploadId: string) => Promise<string>;
    deleteProject: (projectId: string) => void;
    isLoading: boolean;
    isUploadModalOpen: boolean;
    openUploadModal: () => void;
    closeUploadModal: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api";

import { UploadModal } from "@/components/dashboard/UploadModal";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const router = useRouter();
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const fetchProjects = useCallback(async () => {
        if (!isLoaded || !isSignedIn) {
            setIsLoading(false);
            return;
        }

        try {
            console.log(`[ProjectContext] Fetching projects from: ${API_URL}/projects`);
            const token = await getToken();
            const response = await fetch(`${API_URL}/projects`, {
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Map backend data to frontend model if necessary
                // Backend returns: { _id, userId, title, status, ... }
                // Frontend expects: { id, name, type, status, createdAt }
                // We need to map _id -> id, title -> name. "type" is missing in backend model.
                // We should update backend model to include type? Or infer it?
                // For now, let's assume all are "upload" or just pass a default.

                const mappedProjects: Project[] = data.map((p: any) => ({
                    id: p._id,
                    name: p.title,
                    type: "upload", // Default for now as backend doesn't store type yet
                    status: "ready", // Force ready status for all uploaded projects to avoid infinite processing spinner
                    createdAt: p.createdAt,
                }));
                setProjects(mappedProjects);
            } else {
                console.error("Failed to fetch projects");
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn, getToken]);

    // Initial fetch
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const addProject = (type: ProjectType) => {
        // Deprecated placeholder - currently does nothing permanent
        console.warn("addProject (mock) called. Use createProject for real backend.");
    };

    const createProject = async (title: string, s3Key: string, uploadId: string) => {
        try {
            const token = await getToken();
            console.log(`[ProjectContext] Creating project at: ${API_URL}/projects`);
            const response = await fetch(`${API_URL}/projects`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, s3Key, uploadId }),
            });

            if (response.ok) {
                const newProjectData = await response.json();
                // Optimistically add or just re-fetch
                // Let's re-fetch to be safe and simple
                fetchProjects();
                return newProjectData.id;
            } else {
                throw new Error("Failed to create project");
            }
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    };

    const deleteProject = async (projectId: string) => {
        // Optimistic update
        const previousProjects = [...projects];
        setProjects((prev) => prev.filter((p) => p.id !== projectId));

        try {
            const token = await getToken();
            console.log(`[ProjectContext] Deleting project at: ${API_URL}/projects/${projectId}`);
            const response = await fetch(`${API_URL}/projects/${projectId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete project");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
            // Revert on error
            setProjects(previousProjects);
            // Optionally add toast error here
        }
    };

    const openUploadModal = () => setIsUploadModalOpen(true);
    const closeUploadModal = () => setIsUploadModalOpen(false);

    return (
        <ProjectContext.Provider value={{
            projects,
            addProject,
            createProject,
            deleteProject,
            isLoading,
            isUploadModalOpen,
            openUploadModal,
            closeUploadModal
        }}>
            {children}
            <UploadModal isOpen={isUploadModalOpen} onClose={closeUploadModal} />
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProjects must be used within a ProjectProvider");
    }
    return context;
}
