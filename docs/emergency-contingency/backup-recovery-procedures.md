# Backup and Recovery Procedures

## 🛡️ Executive Summary

This document outlines comprehensive backup and disaster recovery procedures for The Profit Platform's client websites and data. These procedures ensure business continuity, data protection, and rapid recovery in case of system failures, cyber attacks, or natural disasters.

**Recovery Objectives:**
- **RTO (Recovery Time Objective):** 4 hours for critical systems
- **RPO (Recovery Point Objective):** Maximum 24 hours data loss
- **Uptime Target:** 99.9% availability

## 📊 Backup Strategy Overview

### Backup Types & Schedule

| Backup Type | Frequency | Retention | Storage Location | Automated |
|------------|-----------|-----------|------------------|-----------|
| Full Backup | Weekly (Sunday 2 AM) | 4 weeks | AWS S3 + Local NAS | Yes |
| Incremental | Daily (2 AM) | 7 days | AWS S3 | Yes |
| Database | Every 6 hours | 48 hours | AWS RDS + S3 | Yes |
| Code Repository | On commit | Indefinite | GitHub + GitLab | Yes |
| Configuration | Daily | 30 days | Encrypted S3 | Yes |
| Media Files | Real-time sync | 90 days | CDN + S3 | Yes |

### 3-2-1 Backup Rule Implementation
- **3** copies of important data
- **2** different storage media types
- **1** offsite backup location

## 🗄️ Data Classification & Priority

### Priority Levels

#### P1 - Critical (Recovery within 1 hour)
- Client databases
- Payment/transaction data
- Authentication systems
- DNS configurations
- SSL certificates

#### P2 - High (Recovery within 4 hours)
- Website files and code
- Email configurations
- Analytics data
- SEO configurations
- API integrations

#### P3 - Medium (Recovery within 24 hours)
- Marketing assets
- Historical reports
- Development environments
- Testing data
- Documentation

#### P4 - Low (Recovery within 72 hours)
- Archived projects
- Old backups
- Training materials
- Internal documentation

## 💾 Backup Procedures

### 1. Automated Daily Backup Process

```bash
#!/bin/bash
# Daily Backup Script - runs at 2 AM via cron

# Variables
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup/daily"
S3_BUCKET="tpp-client-backups"

# Step 1: Database Backup
for DB in $(mysql -e 'show databases' -s --skip-column-names); do
    mysqldump $DB | gzip > "$BACKUP_DIR/db_${DB}_${DATE}.sql.gz"
done

# Step 2: Website Files
for SITE in /var/www/*/; do
    SITE_NAME=$(basename "$SITE")
    tar -czf "$BACKUP_DIR/files_${SITE_NAME}_${DATE}.tar.gz" "$SITE"
done

# Step 3: Configuration Files
tar -czf "$BACKUP_DIR/configs_${DATE}.tar.gz" /etc/nginx /etc/apache2 /etc/ssl

# Step 4: Upload to S3
aws s3 sync "$BACKUP_DIR" "s3://$S3_BUCKET/daily/$DATE/" --delete

# Step 5: Cleanup old local backups (keep 7 days)
find "$BACKUP_DIR" -type f -mtime +7 -delete

# Step 6: Send notification
mail -s "Backup Complete - $DATE" admin@theprofitplatform.com.au < backup_report.txt
```

### 2. Manual Backup Checklist

**Before Major Changes:**
- [ ] Create full system snapshot
- [ ] Export database with structure
- [ ] Backup all configuration files
- [ ] Document current version numbers
- [ ] Test backup integrity
- [ ] Notify team of backup completion

### 3. Real-time Replication Setup

**Database Replication:**
```sql
-- Master Server Configuration
SET GLOBAL server_id = 1;
SET GLOBAL log_bin = 'mysql-bin';
SET GLOBAL binlog_format = 'ROW';

-- Create replication user
CREATE USER 'replica'@'%' IDENTIFIED BY 'secure_password';
GRANT REPLICATION SLAVE ON *.* TO 'replica'@'%';
```

**File Synchronization:**
```bash
# Rsync for real-time file sync
rsync -avz --delete /var/www/ backup-server:/backup/www/
```

## 🔄 Recovery Procedures

### Phase 1: Assessment (0-30 minutes)

1. **Identify Failure Type:**
   - Hardware failure
   - Software corruption
   - Cyber attack
   - Human error
   - Natural disaster

2. **Determine Scope:**
   - Affected systems
   - Data loss extent
   - Number of clients impacted
   - Business functions affected

3. **Activate Response Team:**
   - Technical Lead: [Name] - [Phone]
   - Database Admin: [Name] - [Phone]
   - Network Admin: [Name] - [Phone]
   - Client Relations: [Name] - [Phone]

### Phase 2: Immediate Response (30-60 minutes)

#### Quick Recovery Decision Tree
```
Is primary server accessible?
├─ YES → Attempt in-place recovery
│   ├─ Successful → Monitor and document
│   └─ Failed → Proceed to failover
└─ NO → Immediate failover to backup
    ├─ Activate DR site
    └─ Update DNS records
```

#### Failover Procedure
1. **Activate Standby Systems:**
   ```bash
   # Switch to DR environment
   ./scripts/activate_dr_site.sh

   # Update load balancer
   aws elb register-instances-with-load-balancer \
     --load-balancer-name prod-lb \
     --instances i-dr-instance-id
   ```

2. **Update DNS Records:**
   ```bash
   # Update Route53 to point to DR site
   aws route53 change-resource-record-sets \
     --hosted-zone-id Z123456789 \
     --change-batch file://dns-failover.json
   ```

3. **Verify Services:**
   - [ ] Websites loading
   - [ ] Databases accessible
   - [ ] Email functioning
   - [ ] APIs responding
   - [ ] SSL certificates valid

### Phase 3: Data Recovery (1-4 hours)

#### Database Recovery Steps

1. **Locate Latest Backup:**
```bash
# Find most recent backup
aws s3 ls s3://tpp-client-backups/daily/ --recursive | sort | tail -n 1
```

2. **Download and Verify:**
```bash
# Download backup
aws s3 cp s3://tpp-client-backups/daily/20240914/db_client.sql.gz ./

# Verify integrity
gunzip -t db_client.sql.gz

# Check backup content
zcat db_client.sql.gz | head -n 100
```

3. **Restore Database:**
```bash
# Create new database
mysql -e "CREATE DATABASE client_db"

# Restore from backup
zcat db_client.sql.gz | mysql client_db

# Verify restoration
mysql client_db -e "SELECT COUNT(*) FROM important_table"
```

#### File Recovery Steps

1. **Restore Website Files:**
```bash
# Download file backup
aws s3 cp s3://tpp-client-backups/daily/20240914/files_client.tar.gz ./

# Extract to temporary location
tar -xzf files_client.tar.gz -C /tmp/restore/

# Verify files
ls -la /tmp/restore/

# Move to production
rsync -avz /tmp/restore/ /var/www/client/
```

2. **Restore Configurations:**
```bash
# Restore nginx configs
tar -xzf configs_20240914.tar.gz -C /

# Test configuration
nginx -t

# Reload services
systemctl reload nginx
```

### Phase 4: Validation (4-6 hours)

#### System Verification Checklist

**Infrastructure:**
- [ ] All servers responding
- [ ] Network connectivity stable
- [ ] Load balancers functioning
- [ ] CDN serving content
- [ ] SSL certificates valid

**Applications:**
- [ ] Websites loading correctly
- [ ] Database queries executing
- [ ] Forms submitting properly
- [ ] Payment processing working
- [ ] Email delivery functioning

**Data Integrity:**
- [ ] Record counts match
- [ ] Recent transactions present
- [ ] Media files accessible
- [ ] User sessions valid
- [ ] Analytics tracking active

## 🔐 Security Considerations

### Backup Encryption

**At Rest:**
```bash
# Encrypt backup before storage
openssl enc -aes-256-cbc -salt -in backup.tar -out backup.tar.enc -k $ENCRYPTION_KEY
```

**In Transit:**
- Use SSL/TLS for all transfers
- Implement VPN for site-to-site
- Use SSH for file transfers

### Access Control

**Backup Access Matrix:**
| Role | Read | Write | Delete | Restore |
|------|------|-------|--------|---------|
| Admin | ✓ | ✓ | ✓ | ✓ |
| Tech Lead | ✓ | ✓ | - | ✓ |
| Developer | ✓ | - | - | - |
| Support | ✓ | - | - | - |

### Audit Trail

```bash
# Log all backup operations
echo "$(date) - $USER - $OPERATION - $FILE" >> /var/log/backup_audit.log
```

## 📈 Testing & Validation

### Monthly Disaster Recovery Drill

**Week 1: Table-top Exercise**
- Review procedures
- Identify gaps
- Update documentation

**Week 2: Partial Recovery Test**
- Restore single client site
- Verify data integrity
- Document recovery time

**Week 3: Full Failover Test**
- Complete DR site activation
- Test all client services
- Measure RTO/RPO

**Week 4: Report & Improve**
- Document findings
- Update procedures
- Train team members

### Recovery Test Scenarios

1. **Single File Recovery**
   - Time limit: 15 minutes
   - Success criteria: File restored with correct permissions

2. **Database Recovery**
   - Time limit: 1 hour
   - Success criteria: All tables present, recent data intact

3. **Complete Site Recovery**
   - Time limit: 4 hours
   - Success criteria: Site fully functional, <24hr data loss

4. **Multi-Site Disaster**
   - Time limit: 8 hours
   - Success criteria: All clients operational

## 📝 Documentation Requirements

### Backup Documentation

Each backup should include:
- `backup_manifest.txt` - List of included files
- `backup_info.json` - Metadata (date, size, checksums)
- `recovery_notes.md` - Special instructions
- `verification.log` - Integrity check results

### Recovery Documentation

Post-recovery report must include:
- Incident timeline
- Systems affected
- Data loss assessment
- Recovery actions taken
- Lessons learned
- Improvement recommendations

## 🚨 Emergency Procedures

### Ransomware Attack Response

1. **Immediate Actions:**
   - Isolate affected systems
   - Preserve evidence
   - Activate incident response team
   - Notify law enforcement if required

2. **Recovery Strategy:**
   - Never pay ransom
   - Restore from clean backups
   - Verify backup integrity before restore
   - Implement additional security measures

### Data Breach Response

1. **Containment:**
   - Identify breach vector
   - Close security gap
   - Reset all credentials
   - Enable additional monitoring

2. **Recovery:**
   - Restore from pre-breach backup
   - Audit all restored data
   - Implement enhanced security
   - Notify affected parties per regulations

## 📊 Monitoring & Alerts

### Automated Monitoring

```yaml
# Monitoring configuration
backup_monitoring:
  checks:
    - name: daily_backup_completion
      schedule: "0 3 * * *"
      alert_if_missing: true

    - name: backup_size_validation
      min_size: 100MB
      alert_if_smaller: true

    - name: s3_sync_status
      check_interval: 1h
      alert_on_failure: true

    - name: database_replication_lag
      max_lag: 60s
      alert_if_exceeded: true

  notifications:
    email: ops@theprofitplatform.com.au
    sms: +61400000000
    slack: #ops-alerts
```

### Alert Response Times

| Alert Level | Response Time | Escalation |
|------------|--------------|------------|
| Critical | 15 minutes | Immediate |
| High | 1 hour | After 2 hours |
| Medium | 4 hours | After 8 hours |
| Low | Next business day | After 3 days |

## 🔄 Continuous Improvement

### Quarterly Review Checklist

- [ ] Review and update backup procedures
- [ ] Test all recovery scenarios
- [ ] Update emergency contacts
- [ ] Verify backup storage capacity
- [ ] Review retention policies
- [ ] Update security measures
- [ ] Train new team members
- [ ] Document lessons learned
- [ ] Benchmark recovery times
- [ ] Update client SLAs

### Annual Audit Requirements

1. **Complete Backup Audit:**
   - Verify all backups are accessible
   - Test random sample restoration
   - Review encryption keys
   - Update disaster recovery plan

2. **Compliance Review:**
   - GDPR compliance check
   - Industry standard alignment
   - Client contract requirements
   - Insurance policy review

## 📞 Emergency Contacts

### Internal Team
- **Technical Director:** [Name] - [Mobile] (24/7)
- **Database Admin:** [Name] - [Mobile]
- **Network Admin:** [Name] - [Mobile]
- **Security Lead:** [Name] - [Mobile]

### External Support
- **AWS Support:** [Premium Support Number]
- **Data Center:** [24/7 Hotline]
- **Internet Provider:** [Emergency Line]
- **Security Consultant:** [Contact]

### Client Communication
- **Priority Hotline:** 1300 788 888
- **Emergency Email:** emergency@theprofitplatform.com.au
- **Status Page:** status.theprofitplatform.com.au

---

## Appendices

### A. Backup Script Templates
[Detailed scripts for various backup scenarios]

### B. Recovery Checklists
[Step-by-step checklists for different recovery types]

### C. Vendor Contacts
[Complete list of all vendor support contacts]

### D. Client Priority List
[Ranked list of clients by criticality]

---

*Document Version: 2.0*
*Last Updated: September 2024*
*Next Review: December 2024*
*Owner: Technical Operations Team*