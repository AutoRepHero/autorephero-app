CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`businessType` varchar(100),
	`phone` varchar(30),
	`email` varchar(320),
	`ownerPin` varchar(10) NOT NULL DEFAULT '1234',
	`tagline` text,
	`keywords` json DEFAULT ('[]'),
	`planTier` enum('trial','kit','core','pro') NOT NULL DEFAULT 'trial',
	`trialStartedAt` timestamp NOT NULL DEFAULT (now()),
	`stripeCustomerId` varchar(100),
	`stripeSubscriptionId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int,
	`name` varchar(100),
	`email` varchar(320),
	`phone` varchar(30),
	`businessName` varchar(255),
	`website` varchar(255),
	`source` varchar(50) DEFAULT 'landing',
	`smsConsent` boolean DEFAULT false,
	`marketingConsent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`platformId` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`shortName` varchar(50),
	`icon` varchar(10),
	`color` varchar(20),
	`url` text,
	`reviewCount` int NOT NULL DEFAULT 0,
	`targetCount` int NOT NULL DEFAULT 20,
	`enabled` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platforms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`shares` int NOT NULL DEFAULT 0,
	`reviews` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`name` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
