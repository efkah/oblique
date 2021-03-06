/* eslint-disable */

const fs = require('fs');
const message = fs.readFileSync('.git/COMMIT_EDITMSG').toString().split('\n');
try {
	checkLineLength(message, 100);
	checkEmptyLine(message);
	checkHeader(message[0]);
	checkBreakingChanges(message);
} catch (err) {
	console.error(`\nInvalid commit message:\n${err.message}.\n\nSee details in README.md.\n`);
	process.exit(1);
}

function checkLineLength(lines, length) {
	const error = lines
		.map((line, i) => line.length > length ? numeral(i) : '')
		.filter(line => !!line)
		.join(', ')
		.replace(/,(?=[^,]*$)/, ' and');
	const plural = error.indexOf(' and ' ) > -1;
	if (error) {
		throw new Error(`${error} line${plural ? 's' : ''} exceeds ${length} characters`);
	}
}

function checkEmptyLine(lines) {
	if (lines.length > 1 && !/^$/.test(lines[1])) {
		throw new Error(`2nd line has to be empty`);
	}
}

function checkHeader(header) {
	const {type, scope, subject} = checkFormat(header);
	const readme = fs.readFileSync('README.md', 'utf8');
	const types = extractList(readme, 'Type');
	const scopes = extractList(readme, 'Scope');
	checkType(type, types);
	checkScope(scope, scopes);
	checkSubject(subject);
}

function checkFormat(header) {
	const matches = header.match(/^(?<type>[a-z-]+)(?:\((?<scope>[a-z-]+)\))?:\s(?<subject>.+)$/);
	if (!matches || !matches.groups) {
		throw new Error(`1st line doesn't follow "type(scope): subject" format`);
	}
	return {
		type: matches.groups.type,
		scope: matches.groups.scope,
		subject: matches.groups.subject
	};
}

function checkType(type, types) {
	if(!types.includes(type)){
		throw new Error(`1st line has an invalid type '${type}'. Allowed types are: ${types.join(', ').replace(/,(?=[^,]*$)/, ' and')}`);
	}
}

function checkScope(scope, scopes) {
	if(scope && !scopes.includes(scope)){
		throw new Error(`1st line has an invalid scope '${scope}'. Allowed types are: ${scopes.join(', ').replace(/,(?=[^,]*$)/, ' and')}`);
	}
}

function checkSubject(subject) {
	if(/^[A-Z]/.test(subject)) {
		throw new Error(`1st line has an invalid subject, the first letter must be lower case`);
	}

	if(/\.$/.test(subject)) {
		throw new Error('1st line has an invalid subject, it must not end with a dot "."');
	}
}

function checkBreakingChanges(lines) {
	const breakingLineIndex = lines.findIndex(line => line.toLowerCase().includes('breaking change'));
	if (breakingLineIndex > -1) {
		const breaking = lines[breakingLineIndex];
		const start = `${numeral(breakingLineIndex)} line doesn't follow "BREAKING CHANGE:" format,`;
		if(!/^BREAKING CHANGE/i.test(breaking)) {
			throw new Error(`${start} it must start on a new line`);
		}
		if(!/^BREAKING CHANGE/.test(breaking)) {
			throw new Error(`${start} it must be written in uppercase letter`);
		}
		if(!/^BREAKING CHANGE(?!S)/.test(breaking)) {
			throw new Error(`${start} it must not be plural`);
		}
		if(!/^BREAKING CHANGE(?!S):/.test(breaking)) {
			throw new Error(`${start} it must be terminated with a colon without a whitespace`);
		}
		if(!lines[breakingLineIndex + 1] || !lines[breakingLineIndex + 1].length) {
			throw new Error(`${numeral(breakingLineIndex + 1)} line cannot be empty as it follows a breaking change declaration`);
		}
	}
}

function numeral(i) {
	switch (i + 1) {
		case 1:
			return '1st';
		case 2:
			return '2nd';
		case 3:
			return '3rd';
		default:
			return  `${i + 1}th`
	}
}

function extractList(readme, type) {
	const start = readme.indexOf(`# ${type}`);
	const chunk = readme.substring(readme.indexOf('*', start), readme.indexOf('#', start + 1));
	return chunk.match(/\*\*.*\*\*/g).map(res => res.replace(/\*\*/g, ''));
}
