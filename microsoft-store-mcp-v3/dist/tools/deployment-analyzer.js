"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentAnalyzer = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class DeploymentAnalyzer {
    async analyze(projectPath) {
        const analysis = {
            currentDeployments: [],
            deploymentStrategy: 'unknown',
            recommendations: [],
            issues: [],
        };
        try {
            // Check for common deployment configurations
            const deploymentTypes = await this.detectDeploymentTypes(projectPath);
            for (const type of deploymentTypes) {
                const info = await this.analyzeDeploymentType(projectPath, type);
                analysis.currentDeployments.push(info);
            }
            // Determine overall strategy
            analysis.deploymentStrategy = this.determineStrategy(analysis.currentDeployments);
            // Generate recommendations
            analysis.recommendations = this.generateRecommendations(analysis.currentDeployments);
            // Identify issues
            analysis.issues = this.identifyIssues(analysis.currentDeployments);
        }
        catch (error) {
            analysis.issues.push(`Error analyzing deployments: ${error}`);
        }
        return analysis;
    }
    async detectDeploymentTypes(projectPath) {
        const types = [];
        try {
            // Check for GitHub Actions
            const githubWorkflows = path.join(projectPath, '.github', 'workflows');
            const files = await fs.readdir(githubWorkflows);
            if (files.length > 0) {
                types.push('github-actions');
            }
        }
        catch { }
        try {
            // Check for Vercel
            const vercelConfig = path.join(projectPath, 'vercel.json');
            await fs.access(vercelConfig);
            types.push('vercel');
        }
        catch { }
        try {
            // Check for Netlify
            const netlifyConfig = path.join(projectPath, 'netlify.toml');
            await fs.access(netlifyConfig);
            types.push('netlify');
        }
        catch { }
        try {
            // Check for Docker
            const dockerfile = path.join(projectPath, 'Dockerfile');
            await fs.access(dockerfile);
            types.push('docker');
        }
        catch { }
        try {
            // Check for Kubernetes
            const k8s = path.join(projectPath, 'k8s');
            await fs.access(k8s);
            types.push('kubernetes');
        }
        catch { }
        return types;
    }
    async analyzeDeploymentType(projectPath, type) {
        const info = {
            method: type,
            target: 'unknown',
            status: 'configured',
            notes: [],
        };
        switch (type) {
            case 'github-actions':
                info.target = 'GitHub Pages / Actions';
                info.notes.push('Continuous deployment via GitHub Actions');
                break;
            case 'vercel':
                info.target = 'Vercel';
                info.notes.push('Serverless deployment platform');
                break;
            case 'netlify':
                info.target = 'Netlify';
                info.notes.push('JAMstack deployment platform');
                break;
            case 'docker':
                info.target = 'Container Registry';
                info.notes.push('Containerized deployment');
                break;
            case 'kubernetes':
                info.target = 'Kubernetes Cluster';
                info.notes.push('Orchestrated container deployment');
                break;
        }
        return info;
    }
    determineStrategy(deployments) {
        if (deployments.length === 0) {
            return 'No deployment strategy detected';
        }
        if (deployments.length === 1) {
            return `Single deployment strategy: ${deployments[0].method}`;
        }
        return `Multi-platform strategy: ${deployments.map(d => d.method).join(', ')}`;
    }
    generateRecommendations(deployments) {
        const recommendations = [];
        if (deployments.length === 0) {
            recommendations.push('Consider setting up automated deployment');
            recommendations.push('GitHub Actions is a good starting point');
        }
        if (deployments.length > 2) {
            recommendations.push('Multiple deployment targets may increase complexity');
            recommendations.push('Consider consolidating to 1-2 primary platforms');
        }
        const hasCI = deployments.some(d => d.method === 'github-actions');
        if (!hasCI) {
            recommendations.push('Consider adding CI/CD pipeline for automated testing');
        }
        return recommendations;
    }
    identifyIssues(deployments) {
        const issues = [];
        if (deployments.length === 0) {
            issues.push('No deployment configuration detected');
        }
        // Check for conflicting configurations
        const hasVercel = deployments.some(d => d.method === 'vercel');
        const hasNetlify = deployments.some(d => d.method === 'netlify');
        if (hasVercel && hasNetlify) {
            issues.push('Both Vercel and Netlify configured - may cause confusion');
        }
        return issues;
    }
}
exports.DeploymentAnalyzer = DeploymentAnalyzer;
//# sourceMappingURL=deployment-analyzer.js.map